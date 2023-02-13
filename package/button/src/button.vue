<script lang="ts">
export default {
    name: 'DyButton'
}
</script>
<script setup lang="ts">
import { computed } from 'vue'
import type { IBtn } from '@/button'

const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['event-emit'])

//事件：click事件
const handleClick = (event: MouseEvent, btn: IBtn) => {
    emits('event-emit', {
        opt: props.opt,
        event,
        type: 'click',
        id: btn.id
    })
}

//计算属性：组件禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：按钮数据
const btns = computed<IBtn[]>(() => props.opt.designer_buttons || [])

//定义组件名称
//defineOptions({
//    name: 'DyButton'
//})
</script>

<template>
    <div class="dyform-button">
        <el-button
            v-for="btn in btns"
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

