<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import DyUpload from '@/upload'
import { typeSet } from '~/tools'
import type { IDynamicPlus } from '@/form'

const $DyFormPlus = inject<IDynamicPlus>('$DyFormPlus') //注入动态表单提供的方法
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
const uploadRef = ref<any>()

//事件：click事件
const handleClick = (type: string, file: any) => {
    switch (type) {
        case 'preview':
            emits('event-emit', {
                opt: props.opt,
                type: 'file-click',
                file
            })
            break
        case 'delete':
            uploadRef.value.deleteFile(file)
            break
    }
}
//方法：值改变
const valueChange = (zmbm: string, value: any) => {
    emits('value-change', zmbm, value)
}
//方法：判断文件的类型
const getFileType = (fileName: string) => {
    fileName = fileName.replace(/.+\.(.+)$/, '$1').toUpperCase()
    for (var type in typeSet) {
        if (typeSet[type].indexOf(fileName) !== -1) {
            return type
        }
    }
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：文件列表
const fileList = computed(() => {
    return props.value.map((file: any) => {
        file._type = getFileType(file.name)
        switch (file._type) {
            case 'audio':
                file._icon = 'VideoPlay'
                break
            case 'video':
                file._icon = 'VideoCamera'
                break
            case 'image':
                file._icon = ''
                break
            case 'doc':
                file._icon = 'FolderOpened'
                break
            default:
                file._icon = 'QuestionFilled'
                break
        }
        return file
    })
})

//定义组件名称
defineOptions({
    name: 'DyUploadPicture'
})
</script>

<template>
    <div class="dyform-upload-picture">
        <dy-upload
            ref="uploadRef"
            class="dyform-upload-comp"
            :opt="opt"
            :disabled="isCompDisabled"
            :value="value"
            @value-change="valueChange"
        >
            <template #uploadType>
                <el-icon :class="['dyform-upload-icon', isCompDisabled ? '_disabled' : '']">
                    <Plus />
                </el-icon>
            </template>
        </dy-upload>
        <div
            class="dyform-upload-file"
            v-for="file in fileList"
            :key="file.id"
            @click="handleClick('preview', file)"
        >
            <el-image
                v-if="file._type === 'image'"
                class="dyform-upload-icon"
                :src="$DyFormPlus?.previewUrl + file.id"
                fit="contain"
            ></el-image>
            <el-icon v-else>
                <component :is="file._icon" />
            </el-icon>
            <div class="dyform-upload-filename">{{ file.name }}</div>
            <el-icon
                class="dyform-upload-fileclose"
                v-if="!isCompDisabled"
                @click.stop="handleClick('delete', file)"
            >
                <CircleClose />
            </el-icon>
        </div>
    </div>
</template>

