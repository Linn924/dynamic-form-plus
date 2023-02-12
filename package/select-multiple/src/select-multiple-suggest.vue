<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps([
    'visible',
    'opt',
    'value',
    'mcbm',
    'checkList',
    'dictList',
    'getDictList'
])
const emits = defineEmits(['update:visible', 'value-change'])

//变量
let timer: any = null //定时器
const keyword = ref('') //关键词
const checkValue: any = ref([]) //选中的值
const checkPage = ref(false) //已选列表界面
const checkListCopy: any = ref([]) //选中值对应得选项数组拷贝

//事件：取消按钮点击事件
const cancelBtnClick = () => {
    emits('update:visible', false)
}
//事件：确认按钮点击事件
const confirmBtnClick = () => {
    emits('value-change', checkValue.value)
    emits('update:visible', false)
}
//事件：已选列表点击事件
const fCheckedClick = () => {
    checkListCopy.value = JSON.parse(JSON.stringify(checkList.value))
    checkPage.value = true
}
//事件：已选列表界面已选项删除事件
const checkPageDeleteBtnClick = (index: number) => {
    checkListCopy.value.splice(index, 1)
}
//事件：已选列表界面确认按钮点击事件
const checkPageConfirmBtnClick = () => {
    checkValue.value = checkListValue.value
    checkPage.value = false
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

//计算属性：已选列表页操作后的值数组
const checkListValue: any = computed(() =>
    checkListCopy.value.reduce((arr: any, item: any) => [...arr, item.value], [])
)
//计算属性：字典数据
const dictList = computed(() =>
    props.opt.optionUrl
        ? props.dictList
        : props.dictList.filter((dict: any) => dict.name.indexOf(keyword.value) > -1)
)
//计算属性：选中值对应得选项数组
const checkList = computed(() => {
    let arr: any = []
    let checkValueCopy = JSON.parse(JSON.stringify(checkValue.value))
    const checkList = [...dictList.value, ...props.checkList]
    checkList.forEach(item => {
        let index = checkValueCopy.indexOf(item.value)
        if (index > -1) {
            checkValueCopy.splice(index, 1)
            arr.push(item)
        }
    })
    return arr
})

//生命周期：组件挂载
onMounted(() => {
    checkValue.value = JSON.parse(JSON.stringify(props.value))
    if (props.value.length && !props.mcbm.length) {
        console.log(`${props.opt.zmbm}支持远程搜索时，必须指定 mcbm`)
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
        <div
            class="dyform-suggest-checked _multiple"
            v-if="checkValue.length"
            @click="fCheckedClick"
        >
            <div class="dyform-suggest-title">已选{{ checkValue.length }}项</div>
            <el-icon class="dyform-suggest-icon"><ArrowRight /></el-icon>
        </div>
        <el-checkbox-group class="dyform-suggest-answers _multiple" v-model="checkValue">
            <el-checkbox v-for="item in dictList" :key="item.value" :label="item.value">
                {{ item.name }}
            </el-checkbox>
        </el-checkbox-group>
        <el-button class="dyform-suggest-btn _top" @click="confirmBtnClick">确定</el-button>
        <div class="dyform-suggest-checklist" v-if="checkPage">
            <div class="dyform-suggest-checklistheader">
                <el-button
                    class="dyform-suggest-btn"
                    type="primary"
                    link
                    @click="checkPage = false"
                >
                    取消
                </el-button>
            </div>
            <div class="dyform-suggest-checked _child">
                <div
                    class="dyform-suggest-check"
                    v-for="(item, index) in checkListCopy"
                    :key="item.value"
                    @click="checkPageDeleteBtnClick(index)"
                >
                    <div class="dyform-suggest-checkname">
                        {{ item.name }}
                    </div>
                    <el-icon class="dyform-suggest-icon">
                        <CircleClose />
                    </el-icon>
                </div>
            </div>
            <el-button class="dyform-suggest-btn _top" @click="checkPageConfirmBtnClick">
                确定
            </el-button>
        </div>
    </div>
</template>
