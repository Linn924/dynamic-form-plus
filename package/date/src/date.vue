<script lang="ts">
export default {
    name: 'DyDate'
}
</script>
<script setup lang="ts">
import { computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { date2Str, dateAdd } from '~/wiv'
import type { IProvideForm } from '@/form'

const form = inject<IProvideForm>('form')
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//方法：日期处理
const formatDate = (date: Date, format: string) => {
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    return date2Str(date, format)
}

//组件绑定值
const formValue = computed({
    get() {
        return props.value
    },
    set(value) {
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
})
//计算属性：组件是否禁用
const isCompDisabled = computed(() =>
    typeof props.sfzd === 'boolean' ? props.sfzd : props.opt.sfzd === '1' || props.mode !== 'edit'
)
//计算属性：是否选用 date-picker，判断条件：判断是否包含年月日
const isDatePicker = computed(() => /[YMD]/.test(props.opt.ysj_gs || ''))
//计算属性：日期控件的类型
const type = computed(() => {
    /**
     * 1、只要存在H、HH、h、hh、m、mm、s、ss type='datetime'
     * 2、有且仅有YYYY、YY、M、MM、D、DD type='date'
     * 3、有且仅有YYYY、YY、M、MM type='month'
     * 4、有且仅有YYYY、YY、type='year'
     */
    const format = props.opt.ysj_gs
    let type = 'date'
    const isDatetime = () => {
        const types = ['H', 'HH', 'h', 'hh', 'm', 'mm', 's', 'ss']
        let isResult = false
        types.some(item => {
            if (format.indexOf(item) > -1) {
                isResult = true
                return true
            }
        })
        return isResult
    }
    const isDate = () => {
        const types = ['D', 'DD']
        let isResult = false
        types.some(item => {
            if (format.indexOf(item) > -1) {
                isResult = true
                return true
            }
        })
        return isResult
    }
    const isMonth = () => {
        const types = ['M', 'MM']
        let isResult = false
        types.some(item => {
            if (format.indexOf(item) > -1) {
                isResult = true
                return true
            }
        })
        return isResult
    }
    const isYear = () => {
        const types = ['YYYY', 'YY']
        let isResult = false
        types.some(item => {
            if (format.indexOf(item) > -1) {
                isResult = true
                return true
            }
        })
        return isResult
    }

    if (isDatetime()) {
        type = 'datetime'
    } else if (isDate()) {
        type = 'date'
    } else if (isMonth()) {
        type = 'month'
    } else if (isYear()) {
        type = 'year'
    } else {
        type = 'date'
    }
    return type
})

//声明周期：组件挂载
onMounted(() => {
    //挂载时处理选项默认值
    setTimeout(() => {
        if (props.value === '' && (props.opt.ysj_mrz === 0 || props.opt.ysj_mrz)) {
            let value = ''
            switch (props.opt.ysj_mrz) {
                case 'today':
                    value = formatDate(new Date(), props.opt.ysj_gs || 'YYYY-MM-DD')
                    break
                case 'yesterday':
                    value = formatDate(
                        dateAdd(new Date(), 'd', '-1'),
                        props.opt.ysj_gs || 'YYYY-MM-DD'
                    )
                    break
                default:
                    value = props.opt.ysj_mrz
            }
            emits('value-change', props.opt.zmbm, value)
        }
    }, 0)
})
//生命周期：组件销毁前，将值置空
onBeforeUnmount(() => {
    emits('value-change', props.opt.zmbm, '')
})

//定义组件名称
//defineOptions({
//    name: 'DyDate'
//})
</script>

<template>
    <el-date-picker
        class="dyform-date"
        v-if="isDatePicker"
        v-model="formValue"
        clearable
        :type="type"
        :editable="form?.scene !== 'mobile'"
        :format="props.opt.ysj_gs || 'YYYY-MM-DD'"
        :value-format="props.opt.ysj_gs || 'YYYY-MM-DD'"
        :placeholder="props.opt.placeholder"
        :disabled="isCompDisabled"
    ></el-date-picker>
    <el-time-picker
        class="dyform-date"
        v-else
        clearable
        v-model="formValue"
        :editable="form?.scene !== 'mobile'"
        :format="props.opt.ysj_gs || 'YYYY-MM-DD'"
        :value-format="props.opt.ysj_gs || 'YYYY-MM-DD'"
        :placeholder="props.opt.placeholder"
        :disabled="isCompDisabled"
    ></el-time-picker>
</template>

