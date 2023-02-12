<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import { SelectSuggest } from '@/select'
import store from '~/store'
import { dealDictList } from '~/tools'
import type { IProvideForm } from '@/form'

const form = inject<IProvideForm>('form')
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
let keyword: string | undefined = '' //最新搜索的关键词
const selectRef = ref() //select组件
const state = ref(store.state)
const dictListBySearch = ref('') //远程搜索的数据
const isMobileFocus = ref(false) //移动端模式 是否聚焦到下拉框
const isLoading = ref(false) //远程搜索加载

//事件：change事件
const handleChange = (value: number | string) => {
    let mc = ''
    if (props.opt.mcbm) {
        dictList.value.some((item: any) => {
            if (item.value === value) {
                mc = item.name
                return true
            }
        })
    }
    valueChange({
        name: mc,
        value
    })
}
//事件：focus事件
const handleFocus = () => {
    if (props.opt.filterable === '1') {
        isMobileFocus.value = form?.value.scene === 'mobile'
        props.opt.optionUrl && getDictList()
    }
    nextTick(() => {
        isMobileFocus.value && (selectRef.value.dropMenuVisible = false)
    })
}
//方法：远程搜索回调
const remoteMethod = (value: string) => {
    getDictList(value)
}
//方法：获取字典数据
const getDictList = (key?: string) => {
    keyword = key
    isLoading.value = true
    axios({
        method: 'post',
        url: props.opt.optionUrl,
        data: {
            keyword: key,
            ...(props.opt.optionArgs ? props.opt.optionArgs : {})
        }
    }).then(({ data: res }) => {
        keyword === key && (dictListBySearch.value = res.data || [])
        isLoading.value = false
    })
}
//方法：值改变
const valueChange = ({ name, value }: { name: string; value: number | string }) => {
    if (props.opt.mcbm) {
        emits('value-change', props.opt.mcbm, name)
    }
    emits('value-change', props.opt.zmbm, value)
    setTimeout(() => {
        //保证页面捕获到 change 事件后，执行操作时，可以在页面绑定在表单的数据上获取修改后的值。
        emits('event-emit', {
            opt: props.opt,
            value,
            type: 'change'
        })
    }, 0)
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：默认选中值
const defaultValue = computed(() => {
    return [
        {
            name: form?.value.value[props.opt.mcbm],
            value: props.value
        }
    ]
})
//计算属性：仅在初始渲染时使用默认选中值
const dictListBySearchComputed = computed(() => {
    /**
     * 注意：远程搜索的条件下，只有初始渲染的时候才会使用默认选中值（这样value才能匹配列表的项）
     * 渲染完成之后，修改value值，列表中没有value匹配的项 TODO
     */
    return dictListBySearch.value ? dictListBySearch.value : defaultValue.value
})
//计算属性：字典数据
const dictList = computed(() => {
    const dictList =
        dealDictList(props.opt.ysj_zdlist) ||
        state.value.dictList[props.opt.designer_dictCode] ||
        []
    return props.opt.filterable === '1' && props.opt.optionUrl
        ? dictListBySearchComputed.value
        : dictList
})

//生命周期：组件挂载
onMounted(() => {
    /**
     * 下拉框等控件的 zdlist 支持两种数据来源：静态、字典获取
     * 场景一：未保存字典列表 => 重新请求
     * 场景二：已保存字典列表 => 直接获取本地数据
     * 场景三：已发起请求，还未获取数据 => 待请求成功后获取数据
     */
    if (props.opt.designer_dictCode) {
        store.set(props.opt.designer_dictCode, form?.value.dictUrl)
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
defineOptions({
    name: 'DySelect'
})
</script>

<template>
    <div class="dyform-select">
        <el-select
            ref="selectRef"
            :filterable="props.opt.filterable === '1'"
            :remote="!!props.opt.optionUrl"
            :remote-method="remoteMethod"
            :modelValue="props.value"
            :placeholder="props.opt.placeholder"
            :disabled="isCompDisabled"
            :loading="isLoading"
            :clearable="form?.scene !== 'mobile'"
            @change="handleChange"
            @focus="handleFocus"
        >
            <el-option
                v-for="item in dictList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            ></el-option>
        </el-select>
        <select-suggest
            v-if="isMobileFocus"
            v-model:visible="isMobileFocus"
            :opt="props.opt"
            :value="props.value"
            :dict-list="dictList"
            :get-dict-list="getDictList"
            @value-change="valueChange"
        ></select-suggest>
    </div>
</template>

