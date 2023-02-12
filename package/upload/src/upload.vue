<script setup lang="ts">
import { ref, inject, computed, watch, onMounted } from 'vue'
import { ElMessage, UploadInstance } from 'element-plus'
import { typeSet } from '~/tools'
import type { IProvideForm, IDynamicPlus } from '@/form'

const $DyFormPlus = inject<IDynamicPlus>('$DyFormPlus') //注入动态表单提供的方法
const form = inject<IProvideForm>('form') //注入form组件提供的变量
const props = defineProps(['opt', 'value', 'disabled'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
let successFiles: any = [] //此次已上传成功的文件
let pendingFile = 0 //此次选择上传的文件个数
let computedFile = 0 //此次已完成上传（成功或失败）的文件个数
let handleUploadResult: any = null //处理上传文件返回的结果函数
const fileList = ref([]) //绑定到el-upload的file-list的值
const headers = ref({}) //上传文件接口请求头
const uploadRef = ref<UploadInstance>() //upload组件

//接口：删除文件
const deleteFile = (file: any) => {
    //需要清除el-upload内部的uploadFiles文件
    let index = 0
    fileList.value.some((item: any, index: number) => {
        if (item.id) {
            if (item.id === file.id) {
                index = index
                return true
            }
        } else {
            if (item.response.data?.[0].id === file.id) {
                index = index
                return true
            }
        }
    })
    fileList.value.splice(index, 1)
    emits(
        'value-change',
        props.opt.zmbm,
        props.value.filter((item: any) => item.id !== file.id)
    )
}
//方法：文件上传前的准备
const handleBeforeUpload = (file: any) => {
    if (props.opt.ysj_extra && file.size / 1024 / 1024 > props.opt.ysj_extra) {
        setTimeout(() => {
            ElMessage.error(`${file.name} 该文件大小不能超过${props.opt.ysj_extra}M`)
        }, 0)
        return false
    }
    if (!getFileType(file.name)) {
        setTimeout(() => {
            ElMessage.error(`${file.name} 该文件类型不符合可上传的文件类型`)
        }, 0)
        return false
    }
    //判断当前选择的文件是否满足条件
    pendingFile++
    return true
}
//方法：选中文件超出(本地选中的文件数，已上传的文件数)
const handleExceed = () => {
    ElMessage.error(`${props.opt.zmmc}最多上传${maxUploadFileCount.value[1]}个文件`)
}
//方法：文件上传成功的回调
const handleSuccess = (result: any, file: any) => {
    //每次上传成功一个文件就会跑回调
    computedFile++
    result = handleUploadResult(result, file)
    if (result.success === true) {
        successFiles.push(result.data[0])
    } else {
        ElMessage.error(`${file.name}${result.msg || '上传失败'}`)
    }
    pendingFile === computedFile && valueChange()
}
//方法：文件上传失败的回调
const handleError = (error: any, file: any) => {
    computedFile++
    ElMessage.error(`${file.name}${error || '上传失败'}`)
    pendingFile === computedFile && valueChange()
}
//方法：值改变
const valueChange = () => {
    emits('value-change', props.opt.zmbm, [...props.value, ...successFiles])
    successFiles = []
    pendingFile = computedFile = 0
}
//方法：当前选中的文件是否是属于真正要上传的文件类型
const getFileType = (fileName: string) => {
    let type = []
    let fileType = fileName.replace(/.+\.(.+)$/, '$1').toUpperCase()
    if (!props.opt.ysj_gs) return true
    switch (props.opt.ysj_gs) {
        case 'image/*':
        case 'audio/*':
        case 'video/*':
        case 'doc/*':
            type = typeSet[props.opt.ysj_gs.split('/*')[0]]
            break
        case 'image;doc':
            type = [...typeSet.image, ...typeSet.doc]
            break
    }
    return type.indexOf(fileType) > -1
}

//计算属性：最大上传文件数量
const maxUploadFileCount = computed(() => {
    if (props.opt.ysj_cd) {
        return props.opt.ysj_cd.split(',').map((item: any) => {
            return item === undefined || item === 'undefined' || item === '' ? null : Number(item)
        })
    } else {
        return [null, null]
    }
})
//计算属性：组件显示隐藏
const isCompVisible = computed(
    () => !(maxUploadFileCount.value[1] && maxUploadFileCount.value[1] === props.value.length)
)
//计算属性：接受文件上传的类型
const acceptUploadFileType = computed(() => {
    if (!props.opt.ysj_gs) return null
    switch (props.opt.ysj_gs) {
        case 'image/*':
        case 'audio/*':
        case 'video/*':
            return props.opt.ysj_gs
        case 'doc/*':
            return typeSet.doc.map(type => `.${type}`).join(',')
        case 'image;doc':
            return [...typeSet.image, ...typeSet.doc].map(type => `.${type}`).join(',')
    }
})

watch(
    fileList,
    val => {
        console.log(val)
    },
    { deep: true }
)

//生命周期：组件挂载
onMounted(() => {
    headers.value = ($DyFormPlus?.getUploadHeaders && $DyFormPlus.getUploadHeaders()) || {}
    //需要往el-upload内部的uploadFiles添加文件
    fileList.value = props.value
    //判断使用哪种处理文件的回调方法
    if (form?.value.handleUploadResult) {
        handleUploadResult = form.value.handleUploadResult
    } else if ($DyFormPlus?.handleUploadResult) {
        handleUploadResult = $DyFormPlus.handleUploadResult
    } else {
        handleUploadResult = (data: any) => data
    }
})

//暴露方法
defineExpose({
    deleteFile
})

//定义组件名称
defineOptions({
    name: 'DyUpload'
})
</script>

<template>
    <el-upload
        ref="uploadRef"
        v-show="isCompVisible"
        v-model:file-list="fileList"
        :action="$DyFormPlus?.uploadUrl"
        :headers="headers"
        :limit="maxUploadFileCount[1]"
        :accept="acceptUploadFileType"
        :multiple="!(maxUploadFileCount[1] && maxUploadFileCount[1] <= 1)"
        :show-file-list="false"
        :disabled="disabled"
        :before-upload="handleBeforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-exceed="handleExceed"
    >
        <slot name="uploadType"></slot>
    </el-upload>
</template>

