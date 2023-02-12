<script lang="ts">
export default {
    name: 'DyTextarea'
}
</script>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//事件：input事件
const handleInput = (value: string) => {
    emits('value-change', props.opt.zmbm, value)
}
//事件：change事件
const handleChange = (value: string) => {
    emits('event-emit', {
        opt: props.opt,
        value,
        type: 'change'
    })
}
//事件：click事件
const handleClick = (event: MouseEvent, btn: any) => {
    emits('event-emit', {
        opt: props.opt,
        event,
        type: 'click',
        id: btn.id
    })
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：文本域高度
const compHeight = computed(() => (props.opt.ysj_extra ? Number(props.opt.ysj_extra) : 2))

//生命周期：组件挂载完成
onMounted(() => {
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
//    name: 'DyTextarea'
//})
</script>

<template>
    <div class="dyform-textarea">
        <el-input
            type="textarea"
            clearable
            :modelValue="props.value"
            :placeholder="props.opt.placeholder"
            :disabled="isCompDisabled"
            :rows="compHeight"
            @input="handleInput"
            @change="handleChange"
        ></el-input>
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
    </div>
</template>

