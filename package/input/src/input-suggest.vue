<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps(['visible', 'opt', 'dictList', 'getDictList'])
const emits = defineEmits(['update:visible', 'value-change'])

//变量
let timer: any = null //防抖计时器
const keyword = ref('') //搜索关键词

//事件：取消按钮点击事件
const cancelBtnClick = () => {
    emits('update:visible', false)
}
//事件：确认按钮点击事件
const confirmBtnClick = () => {
    emits('value-change', { value: keyword.value })
    emits('update:visible', false)
}
//事件：列表项点击事件
const listClick = (oData: any) => {
    emits('value-change', oData)
    emits('update:visible', false)
}
//事件：input事件
const handleInput = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        props.getDictList(keyword.value)
    }, 200)
}

//生命周期：组件挂载
onMounted(() => {
    props.getDictList('')
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
        <div class="dyform-suggest-answers">
            <div
                class="dyform-suggest-answer"
                v-for="oOpt in props.dictList"
                :key="oOpt.value"
            >
                <div @click="listClick(oOpt)">{{ oOpt.name }}</div>
            </div>
        </div>
        <el-button class="dyform-suggest-btn _top" @click="confirmBtnClick">
            确定
        </el-button>
    </div>
</template>
