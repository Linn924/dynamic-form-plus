<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import store from '~/store'
import { dealDictList } from '~/tools'
import type { IProvideForm } from '@/form'
import type { IDict } from '@/checkbox'

const form = inject<IProvideForm>('form')
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
const state = ref(store.state)

//事件：change事件
const handleChange = (value: number[] | string[]) => {
    let mcList: string[] = []
    if (props.opt.mcbm) {
        //考虑选中值的顺序
        dictList.value.some((item: IDict) => {
            let index: number
            if (mcList.length === value.length) return true
            index = value.indexOf(item.value as never)
            if (index > -1) {
                mcList[index] = item.name
            }
        })
        emits('value-change', props.opt.mcbm, mcList.join(props.opt.ysj_extra || ';'))
    }
    emits('value-change', props.opt.zmbm, value.join(props.opt.ysj_extra || ';'))
    setTimeout(() => {
        //保证页面捕获到 change 事件后，执行操作时，可以在页面绑定在表单的数据上获取修改后的值。
        emits('event-emit', {
            opt: props.opt,
            value,
            type: 'change'
        })
    }, 0)
}

//计算属性：组件是否禁用
const isCompDisabled = computed(() =>
    typeof props.sfzd === 'boolean' ? props.sfzd : props.opt.sfzd === '1' || props.mode !== 'edit'
)
//计算属性：字典数据
const dictList = computed<IDict[]>(() => {
    return (
        dealDictList(props.opt.ysj_zdlist) ||
        state.value.dictList[props.opt.designer_dictCode] ||
        []
    )
})
//计算属性：组件绑定值
const formValue = computed<string[]>(() =>
    props.value ? props.value.split(props.opt.ysj_extra || ';') : []
)

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
    name: 'DyCheckbox'
})
</script>

<template>
    <el-checkbox-group
        class="dyform-checkbox"
        :modelValue="formValue"
        :disabled="isCompDisabled"
        @change="handleChange"
    >
        <el-checkbox v-for="item in dictList" :key="item.value" :label="item.value">
            {{ item.name }}
        </el-checkbox>
    </el-checkbox-group>
</template>

