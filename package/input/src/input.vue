<script lang="ts">
export default {
    name: 'DyInput'
}
</script>
<script setup lang="ts">
import { ref, inject, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import axios from 'axios'
import { InputSuggest } from '@/input'
import type { IProvideForm } from '@/form'

const dyInputInstance = getCurrentInstance() //当前input实例组件
const form = inject<IProvideForm>('form') //注入form组件提供的变量
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
let keyword = '' //最新搜索的关键词
const autocompleteRef = ref() //el-autocomplete组件
const isMobileFocus = ref(false) //移动端模式 是否聚焦到下拉框
const dictList: any = ref([]) //类似于下拉字典数据

//事件：input事件
const handleInput = (value: string | number) => {
    emits('value-change', props.opt.zmbm, value)
}
//事件：change事件
const handleChange = (value: string | number) => {
    emits('event-emit', {
        opt: props.opt,
        value,
        type: 'change'
    })
}
//事件：选择数据
const handleSelect = ({ value }: { value: string | number }) => {
    emits('value-change', props.opt.zmbm, value)
}
//事件：focus事件
const handleFocus = () => {
    if (props.opt.filterable === '1') {
        isMobileFocus.value = form?.value.scene === 'mobile'
    }
}
//事件：click事件
const handleClick = (event: any, data: any) => {
    emits('event-emit', {
        opt: props.opt,
        event,
        type: 'click',
        id: data.id
    })
}
//方法：获取字典数据
const getDictList = (value: string, callback: any) => {
    keyword = value
    if (props.opt.optionUrl) {
        axios({
            method: 'post',
            url: props.opt.optionUrl,
            data: {
                keyword: value,
                ...(props.opt.optionArgs ? props.opt.optionArgs : {})
            }
        }).then(({ data: res }) => {
            if (keyword === value) {
                dictList.value = Array.isArray(res.data)
                    ? res.data.map((val: any) => ({
                          value: val,
                          name: val
                      }))
                    : []
                callback && callback(dictList.value)
            }
        })
    } else {
        if (value) {
            dictList.value = props.opt.optionList
                .filter((val: any) => val.indexOf(value) > -1)
                .map((val: any) => ({ value: val, name: val }))
        } else {
            dictList.value =
                props.opt.optionList.map((val: any) => ({
                    value: val,
                    name: val
                })) || []
        }
        callback && callback(dictList.value)
    }
}
//方法：移动端模式 数据改变
const valueChange = ({ value }: { value: string | number }) => {
    handleSelect({ value })
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：autocomplete组件中的suggestionVisible
const suggestionVisible = computed(() => {
    const comp = autocompleteRef.value
    const isValidData = comp.suggestions.length > 0
    return (isValidData || comp.loading) && comp.activated
})

//生命周期：组件挂载完成
onMounted(() => {
    /**
     * input搜索建议开启时，选择搜索建议会导致文本框失焦，触发验证
     */
    // 显示搜索建议
    if (props.opt.filterable === '1') {
        // 监听建议框是否还显示
        watch(suggestionVisible, val => {
            if (!val) {
                // 关闭后触发blur验证 TODO(需找到其他解决方法)
                setTimeout(() => {
                    autocompleteRef.value?.blur()
                }, 1)
            }
        })
        // 监听建议框是否还显示（移动端）
        watch(isMobileFocus, val => {
            if (!val) {
                // 关闭后触发blur验证
                setTimeout(() => {
                    dyInputInstance?.parent?.exposed?.validate('blur', () => {})
                }, 0)
            }
        })
    }
    //挂载时处理选项默认值
    setTimeout(() => {
        if (props.value === '' && (props.opt.ysj_mrz === 0 || props.opt.ysj_mrz)) {
            emits('value-change', props.opt.zmbm, props.opt.ysj_mrz)
        }
    }, 0)
})
//生命周期：组件销毁前，将值置空
onBeforeUnmount(() => {
    emits('value-change', props.opt.zmbm, '')
})

//定义组件名称
//defineOptions({
//    name: 'DyInput'
//})
</script>

<template>
    <div class="dyform-input">
        <el-autocomplete
            ref="autocompleteRef"
            v-if="props.opt.filterable === '1'"
            clearable
            :modelValue="props.value"
            :placeholder="props.opt.placeholder"
            :disabled="isCompDisabled"
            :fetch-suggestions="getDictList"
            @input="handleInput"
            @select="handleSelect"
            @change="handleChange"
            @focus="handleFocus"
        />
        <el-input
            v-else
            clearable
            :modelValue="props.value"
            :placeholder="props.opt.placeholder"
            :disabled="isCompDisabled"
            @input="handleInput"
            @change="handleChange"
            @focus="handleFocus"
        />
        <el-button
            v-for="btn in props.opt._prj_button"
            :key="btn.id"
            :class="{ _notext: !btn.text }"
            v-bind="{ disabled: isCompDisabled, ...btn.el }"
            @click="handleClick($event, btn)"
        >
            <template #default>
                {{ btn.text }}
            </template>
        </el-button>
        <input-suggest
            v-if="isMobileFocus"
            v-model:visible="isMobileFocus"
            :opt="props.opt"
            :dict-list="dictList"
            :get-dict-list="getDictList"
            @value-change="valueChange"
        ></input-suggest>
    </div>
</template>

