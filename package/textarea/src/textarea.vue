<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：文本域高度
const compHeight = computed(() =>
    props.opt.ysj_extra ? Number(props.opt.ysj_extra) : 2
)

//生命周期：组件挂载完成
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
//事件：click事件
const handleClick = (event: any, data: any) => {
    emits('event-emit', {
        opt: props.opt,
        event,
        type: 'click',
        id: data.id
    })
}

//定义组件name
defineOptions({
    name: 'DyTextarea'
})
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
            v-for="item in props.opt._prj_button"
            :key="item.id"
            v-bind="{ disabled: isCompDisabled, ...item.el }"
            @click="handleClick($event, item)"
        >
            <el-icon v-if="item.el.icon">
                <component :is="item.el.icon"></component>
            </el-icon>
            <span v-if="item.text">{{ item.text }}</span>
        </el-button>
    </div>
</template>

