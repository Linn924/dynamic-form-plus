<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import type { IProvideForm } from '@/form'

const $DyFormPlus = inject<any>('$DyFormPlus') //注入动态表单提供的方法
const form = inject<IProvideForm>('form') //注入form组件提供的变量
const props = defineProps(['opt', 'rules', 'value', 'prop', 'item', 'sfzd'])
const emits = defineEmits(['update:value', 'value-change', 'event-emit'])

//变量
const previewUrl = $DyFormPlus.previewUrl //图标地址前缀(应使用下载地址和imgid拼接)
const dyformitemRef = ref<any>() //所有子组件

//计算属性：是否显示el-form-item的label
const isLabelShow = computed(
    () => props.opt.ysj_sfycmc !== '1' && props.opt.dynamicform_thcols !== '0'
)

//接口：组件校验方法
const validate = () => {
    const validate = dyformitemRef.value?.validate
    return validate?.() ?? true
}
//方法：抛出最新值
const valueChange = (...args: any[]) => {
    emits('value-change', ...args)
}
//方法：事件触发
const eventEmit = (oEventArgs: any) => {
    emits('event-emit', oEventArgs)
}

//暴露验证方法
defineExpose({
    validate,
    opt: props.opt
})
</script>

<template>
    <el-form-item
        :class="['dyform-item', props.opt.dynamicform_class]"
        :prop="props.prop"
        :rules="props.opt.dynamicform_rules"
        :label-width="props.opt.dynamicform_thcols"
    >
        <template #label>
            <div class="dyform-label" v-if="isLabelShow">
                <!--图标-->
                <el-icon v-if="props.opt.designer_mcIcon">
                    <component :is="props.opt.designer_mcIcon"></component>
                </el-icon>
                <template v-else>
                    <el-tooltip
                        effect="dark"
                        placement="top"
                        :content="props.opt.wzms"
                        v-if="props.opt.wzms || props.opt.imgid"
                    >
                        <el-image
                            fit="contain"
                            class="dyform-icon"
                            :src="previewUrl + props.opt.imgid"
                        >
                            <template #error>
                                <div class="image-slot">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                    </el-tooltip>
                </template>
                <!--表单项名称-->
                {{ props.opt.zmmc }}
                <!--度量单位-->
                {{
                    props.opt.dlDw && (!props.opt.dlDwgs || props.opt.dlDwgs === '0')
                        ? `(${props.opt.dlDw})`
                        : ''
                }}
                {{ props.opt.ysj_bxxs.indexOf('edit') > -1 ? '' : ':' }}
            </div>
        </template>
        <div class="dyform-item-content">
            <!--控件-->
            <!-- 
                rules：用户自定义规则
                    在 edittable、editcard、cascader 中，将根据 opt 及 rules 生成子项的验证规则
                    其他控件中暂未使用 rules 
            -->
            <component
                :is="`dy-${props.opt.ysj_bxxs}`"
                class="dyform-component"
                ref="dyformitemRef"
                :mode="form?.mode"
                :opt="props.opt"
                :rules="props.rules"
                :value="props.value"
                :item="props.item"
                :sfzd="props.sfzd"
                @value-change="valueChange"
                @event-emit="eventEmit"
            ></component>
            <!--度量单位-->
            <span v-if="props.opt.dlDwgs === '1'">{{ props.opt.dlDw }}</span>
        </div>
    </el-form-item>
</template>
