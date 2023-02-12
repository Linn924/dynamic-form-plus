<script setup lang="ts">
import { ref, computed } from 'vue'
import DyUpload from '@/upload'

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

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})

//定义组件名称
defineOptions({
    name: 'DyUploadText'
})
</script>

<template>
    <div class="dyform-upload-text">
        <dy-upload
            ref="uploadRef"
            class="dyform-upload-comp"
            :opt="props.opt"
            :disabled="isCompDisabled"
            :value="value"
            @value-change="valueChange"
        >
            <template #uploadType>
                <el-button :disabled="isCompDisabled" type="success">上传</el-button>
            </template>
        </dy-upload>
        <div
            class="dyform-upload-file"
            v-for="file in props.value"
            :key="file.id"
            @click="handleClick('preview', file)"
        >
            <div>{{ file.name }}</div>
            <div v-if="!isCompDisabled" @click.stop="handleClick('delete', file)">删除</div>
        </div>
    </div>
</template>

