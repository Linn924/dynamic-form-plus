<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import type { IProvideForm } from '@/form'

const form: any = inject('form')
const props = defineProps(['visible', 'opt', 'value', 'dictList', 'getDictList'])
const emits = defineEmits(['update:visible', 'value-change'])

//变量
let timer: any = null //定时器
const keyword = ref('') //关键词

//计算属性：字典数据
const dictList = computed(() =>
    props.opt.optionUrl
        ? props.dictList
        : props.dictList.filter((dict: any) => dict.name.indexOf(keyword.value) > -1)
)
//计算属性：配置mcbm的值
const dictName = computed(() => (props.opt.mcbm ? form.value.value[props.opt.mcbm] : ''))

//事件：取消按钮点击事件
const cancelBtnClick = () => {
    emits('update:visible', false)
}
//事件：已选列表项删除事件
const deleteBtnClick = () => {
    emits('value-change', '')
    emits('update:visible', false)
}
//事件：列表项点击事件
const listClick = (data: any) => {
    emits('value-change', data)
    emits('update:visible', false)
}
//事件：input事件
const handleInput = () => {
    props.opt.optionUrl && debounce()
}
//方法：防抖
const debounce = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        props.getDictList(keyword.value)
    }, 200)
}

//生命周期：组件挂载
onMounted(() => {
    if (props.value && !props.opt.mcbm) {
        console.warn(`${props.opt.zmbm}支持远程搜索时，请指定 mcbm。`)
    }
})
//生命周期：组件销毁
onBeforeUnmount(() => {
    keyword.value = ''
    clearTimeout(timer)
})
</script>

<template>
    <div class="v-modal _extend">
        <div class="dyform-suggest-header">
            <el-input v-model="keyword" @input="handleInput"></el-input>
            <el-button
                size="small"
                type="primary"
                class="dyform-suggest-button"
                link
                @click="cancelBtnClick"
            >
                取消
            </el-button>
        </div>
        <div class="dyform-suggest-checked" v-if="value">
            <div class="dyform-suggest-check" @click="deleteBtnClick">
                <div class="dyform-suggest-checkname">{{ dictName }}</div>
                <el-icon class="dyform-suggest-icon"><CircleClose /></el-icon>
            </div>
        </div>
        <div class="dyform-suggest-answers">
            <div class="dyform-suggest-answer" v-for="item in dictList" :key="item.value">
                <div @click="listClick(item)">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>
