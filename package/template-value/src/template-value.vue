<script lang="ts">
export default {
    name: 'DyTemplateValue'
}
</script>
<script setup lang="ts">
import { computed, watch, inject } from 'vue'
import type { IProvideForm } from '@/form'

const form = inject<IProvideForm>('form')
const props = defineProps(['item', 'opt'])
const emits = defineEmits(['value-change'])

//计算属性：模板值
const templateValue = computed(() => {
    const reg = /\$\{((?:.|\r?\n)+?)\}/
    let str = '',
        arr
    if (props.opt.ysj_mrz) {
        str = props.opt.ysj_mrz
        while ((arr = str.match(reg)) != null) {
            str = str.replace(
                arr[0],
                arr[1].indexOf('item') > -1
                    ? props.item[arr[1].split('.')[1]]
                    : form?.value.value[arr[1]]
            )
        }
    }
    return str
})

//监听：监听模板值变化
watch(templateValue, val => {
    emits('value-change', props.opt.zmbm, val)
})

//定义组件名称
//defineOptions({
//    name: 'DyTemplateValue'
//})
</script>

<template>
    <div class="dyform-template-value">{{ templateValue }}</div>
</template>

