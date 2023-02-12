<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { validator } from '../../../utils/wiv'

const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//计算属性：组件是否禁用
const isCompDisabled = computed(() =>
    typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
)
//计算属性：绑定值的处理
const modifiedValue = computed(() =>
    props.value === 0 ? '0' : (props.value || '').toString().trim()
)

//事件：input事件
const handleInput = (value: number | string) => {
    emits('value-change', props.opt.zmbm, value)
}
//事件：change事件
const handleChange = (value: number | string) => {
    emits('event-emit', {
        opt: props.opt,
        value,
        type: 'change'
    })
}
//事件：blur事件
const handleBlur = () => {
    blurCallback()
}
//方法：blur事件，失去焦点后，格式化数据
const blurCallback = () => {
    const isNumber = validator.number //判断是否是数字
    let bit
    let reg
    let arr = []

    if (modifiedValue.value === '' || !isNumber(modifiedValue.value)) {
        emits('value-change', props.opt.zmbm, '')
        return
    }
    if (props.opt.ysj_extra) {
        bit = Number(props.opt.ysj_extra)
        reg = new RegExp(`^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{${bit}})$`)
        if (!reg.test(modifiedValue.value)) {
            arr = modifiedValue.value.split('.') //小数还是整数
            if (arr.length === 1) {
                //值为整数
                emits(
                    'value-change',
                    props.opt.zmbm,
                    `${modifiedValue.value}.${'0'.repeat(bit)}`
                )
            } else {
                //值为小数
                if (arr[1].length > bit) {
                    //小数位数大于固定的小数位数，截取
                    emits(
                        'value-change',
                        props.opt.zmbm,
                        modifiedValue.value.slice(
                            0,
                            modifiedValue.value.length - (arr[1].length - bit)
                        )
                    )
                } else {
                    //小数位数小于固定的小数位数，补位
                    emits(
                        'value-change',
                        props.opt.zmbm,
                        `${modifiedValue.value}${'0'.repeat(
                            bit - arr[1].length
                        )}`
                    )
                }
            }
        }
    }
}

//生命周期：组件挂载
onMounted(() => {
    //挂载时处理选项默认值
    setTimeout(() => {
        if (
            props.value === '' &&
            (props.opt.ysj_mrz === 0 || props.opt.ysj_mrz)
        ) {
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
    name: 'DyNumber'
})
</script>

<template>
    <el-input
        class="dyform-number"
        clearable
        :modelValue="value"
        :placeholder="opt.placeholder"
        :disabled="isCompDisabled"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
    ></el-input>
</template>

