<script setup lang="ts">
import { ref, computed, watch, inject, onMounted } from 'vue'
import { DyFormItem } from '@/form'
import { ElMessage } from 'element-plus'
import { validateExtra, parseOpts, deepJudge, getRelValidateOpt } from '~/tools'
import type { IProvideForm, IFormData } from '@/form'
import type { FormInstance } from 'element-plus'

const form = inject<IProvideForm>('form') //注入form组件提供的变量
const props = defineProps({
    mode: {
        type: String
    },
    opt: {
        type: Object,
        default: () => ({})
    },
    value: {
        type: Object,
        default: () => ({})
    },
    sfzd: {
        type: [String, Boolean],
        default: ''
    },
    rules: {
        type: Array,
        default: () => []
    }
})
const emits = defineEmits(['value-change', 'event-emit'])

//变量
const formRef = ref<FormInstance>() //当前组件内部el-form
const formdata = ref<IFormData[]>([]) //处理后的formdata
const cardValue = ref<any>([]) //卡片数据
const defaultCardValue = ref<any>({}) //默认卡片表单项
const cardLimit = ref<any>([]) //卡片限制范围

//接口：验证方法
const validate = async () => {
    let isSuccess
    if (!validateExtra(props.opt.ysj_cd, cardValue.value)) {
        setTimeout(() => {
            ElMessage.error(`${props.opt.zmmc}不符合配置数据范围`)
        }, 0)
        return false
    }
    await formRef.value?.validate((isValid: boolean) => {
        isSuccess = isValid
    })
    return isSuccess
}
//事件：click事件
const handleClick = (type: string, index?: number) => {
    let arr: any = []
    switch (type) {
        case 'add': //添加
            arr = [...cardValue.value, defaultCardValue.value]
            break
        case 'delete': //删除
            arr = JSON.parse(JSON.stringify(cardValue.value))
            arr.splice(index, 1)
            break
    }
    emits('value-change', props.opt.zmbm, arr)
}
//方法：
const itemValueChange = (index: number, [zmbm, value]: [string, any]) => {
    if (index === cardValue.value.length) return
    cardValue.value[index][zmbm] = value
    emits('value-change', props.opt.zmbm, cardValue.value)
}
//方法：触发事件
const eventEmit = (index: number, opt: any) => {
    emits('event-emit', {
        $index: index,
        ...opt
    })
}
//方法：初始化组件
const init = () => {
    let defaultCardList = []
    let value = []
    const splitString = (str: string) => {
        return str.split(',').map(item => (item === undefined ? undefined : Number(item)))
    }
    defaultCardList = props.value.map((item: any) => {
        return {
            ...defaultCardValue.value,
            ...item
        }
    })
    //只有在编辑状态下才会去判断是否需要生成卡片
    if (form?.value.mode === 'edit') {
        if (props.opt.ysj_cd) {
            cardLimit.value = splitString(props.opt.ysj_cd)
            if (cardLimit.value[0]) {
                //考虑初始值问题，补充卡片的数量以及卡片内表单项的初始值
                value =
                    defaultCardList.length >= cardLimit.value[0]
                        ? defaultCardList
                        : [
                              ...defaultCardList,
                              ...Array.from(
                                  {
                                      length: cardLimit.value[0] - defaultCardList.length
                                  },
                                  () => defaultCardValue.value
                              )
                          ]
                emits('value-change', props.opt.zmbm, value)
            }
        }
    }
}
//方法：处理配置项
const handelOpts = () => {
    const { oOptValue, aFormData } = parseOpts({
        opts: props.opt.formdata,
        mode: props.mode,
        rules: props.rules,
        scene: form?.value.scene
    })
    formdata.value = aFormData || []
    defaultCardValue.value = oOptValue
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：表单绑定值
const formValue = computed(() => {
    return {
        list: cardValue.value
    }
})
//计算属性：卡片处理后的数据
const cardListComputed = computed(() =>
    Array.from({ length: cardValue.value.length }, () => formdata.value)
)
//计算属性：卡片右上角删除按钮显示隐藏
const isCardDeleteBtn = computed(
    () =>
        !isCompDisabled.value &&
        (!cardLimit.value[0] || cardLimit.value[0] < cardValue.value.length)
)
//计算属性：卡片底部新增按钮显示隐藏
const isCardAddBtn = computed(
    () =>
        !isCompDisabled.value &&
        (!cardLimit.value[1] || cardLimit.value[1] > cardValue.value.length)
)

//监听：将表单传入的值赋值给控件v-model绑定的值
watch(
    () => props.value,
    val => {
        cardValue.value = val ? JSON.parse(JSON.stringify(val)) : []
    },
    {
        immediate: true
    }
)
//监听：监听传入的配置项，获取表单项及验证规则
watch(
    () => props.opt,
    () => {
        handelOpts()
    },
    {
        immediate: true
    }
)

//生命周期：组件挂载
onMounted(() => {
    init()
})

//暴露方法
defineExpose({
    validate
})

//定义组件名称
defineOptions({
    name: 'DyEditcard'
})
</script>

<template>
    <div class="dyform-editcard">
        <el-form
            ref="formRef"
            :model="formValue"
            :validate-on-rule-change="false"
            :label-position="form?.scene === 'mobile' ? 'top' : 'right'"
            :label-width="props.opt.dynamicform_thcols || form?.labelWidth"
        >
            <el-card
                class="dyform-card"
                v-for="(card, index) in cardListComputed"
                :key="'card' + index"
            >
                <template #header>
                    <div class="dyform-card-title" v-if="isCardDeleteBtn">
                        <el-icon @click="handleClick('delete', index)">
                            <CircleClose />
                        </el-icon>
                    </div>
                </template>
                <el-row>
                    <template v-for="(oOpt, idx) in card">
                        <el-col
                            v-if="
                                deepJudge(
                                    oOpt,
                                    cardListComputed[index],
                                    props.value[index] || {},
                                    'monomer',
                                    form
                                )
                            "
                            :key="'cols' + idx"
                            :span="oOpt.dynamicform_tdcols"
                            :class="{
                                'dyform-clearleft': oOpt.zwcols === '1' || oOpt.dynamicform_linefeed
                            }"
                        >
                            <dy-form-item
                                :opt="getRelValidateOpt(oOpt, form?.value, index)"
                                :prop="'list.' + index + `.${oOpt.zmbm}`"
                                :rules="props.rules[oOpt.zmbm]"
                                :value="formValue.list[index][oOpt.zmbm]"
                                :item="props.value[index] || {}"
                                :sfzd="props.sfzd || oOpt._prj_disabled"
                                @value-change="
                                    (zmbm, value) => {
                                        itemValueChange(index, [zmbm, value])
                                    }
                                "
                                @event-emit="
                                    opt => {
                                        eventEmit(index, opt)
                                    }
                                "
                            ></dy-form-item>
                        </el-col>
                    </template>
                </el-row>
            </el-card>
        </el-form>
        <el-button class="dyform-card-addbtn" v-if="isCardAddBtn" @click="handleClick('add')">
            <el-icon><Plus /></el-icon>
            新增
        </el-button>
    </div>
</template>

