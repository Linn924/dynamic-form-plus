<script setup lang="ts">
import { ref, computed, inject, onBeforeUnmount, getCurrentInstance } from 'vue'
import city from './cascader.json'
import type {
    IShengJi,
    IShiJi,
    IQuXian,
    IJieDao,
    ISheQu,
    TCascader,
    TCascaderList
} from '@/cascader'
import type { IProvideForm } from '@/form'
import type { FormInstance, FormRules } from 'element-plus'

const form = inject<IProvideForm>('form')
const props = defineProps(['mode', 'opt', 'value', 'sfzd'])
const emits = defineEmits(['value-change', 'event-emit'])

//变量
const defaultCascaderVariable = {
    //级联默认变量名称
    shengji: '',
    shengjiCode: '',
    shiji: '',
    shijiCode: '',
    quxian: '',
    quxianCode: '',
    jiedao: '',
    jiedaoCode: '',
    shequ: '',
    shequCode: '',
    xxdz: ''
}
const formRef = ref<FormInstance>() //当前组件内部el-form
const cascaderInstance = getCurrentInstance() //当前组件实例

//接口：验证
const validate = async () => {
    let isSuccess: boolean = false
    await formRef.value?.validate((isValid: boolean) => {
        isSuccess = isValid
    })
    return isSuccess
}
//事件：处理事件
const handleEvent = (key: string, value: number | string) => {
    const fields = ['shengji', 'shiji', 'quxian', 'xxdz']
    let data = {
        ...formValue.value,
        [key]: value
    }
    const getCode = (list: TCascaderList, value: string | number) => {
        let code = ''
        list.some((item: TCascader) => {
            if (item.s === value) {
                code = item.y || ''
                return true
            }
        })
        return code
    }
    if (formValue[key] !== value) {
        switch (key) {
            case 'shengji': //省级
                data = {
                    ...data,
                    shiji: '',
                    quxian: '',
                    jiedao: '',
                    shequ: '',
                    shengjiCode: getCode(shengjiList.value, value)
                }
                break
            case 'shiji': //市级
                data = {
                    ...data,
                    quxian: '',
                    jiedao: '',
                    shequ: '',
                    shijiCode: getCode(shijiList.value, value)
                }
                break
            case 'quxian': //区县
                data = {
                    ...data,
                    jiedao: '',
                    shequ: '',
                    quxianCode: getCode(quxianList.value, value)
                }
                break
            case 'jiedao': //街道
                data = {
                    ...data,
                    shequ: '',
                    jiedaoCode: getCode(jiedaoList.value, value)
                }
                formRef.value?.clearValidate('jiedao')
                break
            case 'shequ': //社区
                data = {
                    ...data,
                    shequCode: getCode(shequList.value, value)
                }
                formRef.value?.clearValidate('shequ')
                break
        }
        emits('value-change', props.opt.zmbm, JSON.stringify(data))
        if (props.opt.mcbm) {
            emits(
                'value-change',
                props.opt.mcbm,
                fields
                    .reduce((arr: number[] | string[], field) => [...arr, data[field]], [])
                    .join('')
            )
        } else if (form?.value.cityZmbmSuffix) {
            emits(
                'value-change',
                `${props.opt.zmbm}${form.value.cityZmbmSuffix}`,
                fields
                    .reduce((arr: number[] | string[], field) => [...arr, data[field]], [])
                    .join('')
            )
        }
        setTimeout(() => {
            cascaderInstance?.parent?.exposed?.validate('change', () => {})
        }, 0)
    }
}

//计算属性：组件是否禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：表单数据
const formValue = computed<any>(() => {
    return {
        ...defaultCascaderVariable,
        ...(props.value ? JSON.parse(props.value) : {})
    }
})
//计算属性：省级数据
const shengjiList = computed<IShengJi[]>(() => {
    return form?.value.cityData?.length ? form.value.cityData : city
})
//计算属性：市级数据
const shijiList = computed<IShiJi[]>(() => {
    let list: IShiJi[] = []
    shengjiList.value.some((item: any) => {
        if (item.p === formValue.value.shengji) {
            list = item.c
            return true
        }
    })
    return list
})
//计算属性：区县数据
const quxianList = computed<IQuXian[]>(() => {
    let list: IQuXian[] = []
    shijiList.value.some((item: any) => {
        if (item.n === formValue.value.shiji) {
            list = item.a
            return true
        }
    })
    return list
})
//计算属性：街道数据
const jiedaoList = computed<IJieDao[]>(() => {
    let list: IJieDao[] = []
    quxianList.value.some((item: any) => {
        if (item.s === formValue.value.quxian) {
            list = item.j
            return true
        }
    })
    return list || []
})
//计算属性：社区数据
const shequList = computed<ISheQu[]>(() => {
    let list: ISheQu[] = []
    jiedaoList.value.some((item: any) => {
        if (item.s === formValue.value.jiedao) {
            list = item.q
            return true
        }
    })
    return list || []
})
//计算属性：验证规则
const rules = computed<FormRules>(() => {
    let rules = {}
    if (props.mode === 'edit' && props.opt.sfbt === '1') {
        rules = {
            shengji: [{ required: true, trigger: 'change', message: '必选' }],
            shiji: [{ required: true, trigger: 'change', message: '必选' }],
            quxian: [{ required: true, trigger: 'change', message: '必选' }],
            jiedao: [{ required: true, trigger: 'blur', message: '必填' }],
            shequ: [{ required: true, trigger: 'blur', message: '必填' }],
            xxdz: [{ required: true, trigger: 'blur', message: '必填' }]
        }
    }
    return rules
})
//计算属性：省级下拉框禁用
const isShengjiDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('shengji') > -1
)
//计算属性：市级下拉框禁用
const isShijiDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('shiji') > -1
)
//计算属性：区县下拉框禁用
const isQuxianDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('quxian') > -1
)
//计算属性：街道输入框禁用
const isJiedaoDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('jiedao') > -1
)
//计算属性：社区输入框禁用
const isShequDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('shequ') > -1
)
//计算属性：详细地址输入框禁用
const isXxdzDisabled = computed(
    () => typeof props.sfzd === 'object' && props.sfzd.indexOf('xxdz') > -1
)

//生命周期：组件销毁
onBeforeUnmount(() => {
    emits('value-change', props.opt.zmbm, JSON.stringify(defaultCascaderVariable))
})

//暴露方法
defineExpose({
    validate
})

//定义组件名称
defineOptions({
    name: 'DyCascader'
})
</script>

<template>
    <el-form
        class="dyform-cascadergroup"
        ref="formRef"
        label-width="0"
        :model="formValue"
        :validate-on-rule-change="false"
        :disabled="isCompDisabled"
    >
        <el-form-item class="dyform-cascader _shengji" prop="shengji" :rules="rules['shengji']">
            <el-select
                placeholder="请选择省"
                :modelValue="formValue.shengji"
                @change="(val:number|string)=>{handleEvent('shengji',val)}"
                :disabled="isShengjiDisabled"
                clearable
            >
                <el-option
                    v-for="item in shengjiList"
                    :key="item.p"
                    :label="item.p"
                    :value="item.p"
                ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item class="dyform-cascader _shiji" prop="shiji" :rules="rules['shiji']">
            <el-select
                placeholder="请选择市"
                :modelValue="formValue.shiji"
                @change="(val:number|string) => {handleEvent('shiji', val)}"
                :disabled="isShijiDisabled"
                clearable
            >
                <el-option
                    v-for="item in shijiList"
                    :key="item.n"
                    :label="item.n"
                    :value="item.n"
                ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item class="dyform-cascader _quxian" prop="quxian" :rules="rules['quxian']">
            <el-select
                placeholder="请选择区县"
                :modelValue="formValue.quxian"
                @change="(val:number|string) => {handleEvent('quxian', val)}"
                :disabled="isQuxianDisabled"
                clearable
            >
                <el-option
                    v-for="item in quxianList"
                    :key="item.s"
                    :label="item.s"
                    :value="item.s"
                ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item
            v-if="opt.ysj_gs === 'ssqjx' || opt.ysj_gs === 'ssqjsx'"
            class="dyform-cascader _jiedao"
            prop="jiedao"
            :rules="rules['jiedao']"
        >
            <el-select
                v-if="jiedaoList.length"
                placeholder="请选择街道"
                :modelValue="formValue.jiedao"
                @change="(val:number|string) => {handleEvent('jiedao', val)}"
                :disabled="isJiedaoDisabled"
                clearable
            >
                <el-option
                    v-for="item in jiedaoList"
                    :key="item.s"
                    :label="item.s"
                    :value="item.s"
                ></el-option>
            </el-select>
            <el-input
                v-else
                placeholder="请填写街道"
                :modelValue="formValue.jiedao"
                @input="(val:number|string) => {handleEvent('jiedao', val)}"
                :disabled="isJiedaoDisabled"
                clearable
            ></el-input>
        </el-form-item>
        <el-form-item
            v-if="opt.ysj_gs === 'ssqjsx'"
            class="dyform-cascader _shequ"
            prop="shequ"
            :rules="rules['shequ']"
        >
            <el-select
                v-if="shequList.length"
                placeholder="请选择社区"
                :modelValue="formValue.shequ"
                @change="(val:number|string) => {handleEvent('shequ', val)}"
                :disabled="isShequDisabled"
                clearable
            >
                <el-option
                    v-for="item in shequList"
                    :key="item.s"
                    :label="item.s"
                    :value="item.s"
                ></el-option>
            </el-select>
            <el-input
                v-else
                placeholder="请填写社区"
                :modelValue="formValue.shequ"
                @input="(val:number|string) => {handleEvent('shequ', val)}"
                :disabled="isShequDisabled"
                clearable
            ></el-input>
        </el-form-item>
        <el-form-item class="dyform-cascader _xxdz" prop="xxdz" :rules="rules['xxdz']">
            <el-input
                placeholder="请填写详细地址"
                :modelValue="formValue.xxdz"
                @input="(val:number|string) => {handleEvent('xxdz', val)}"
                :disabled="isXxdzDisabled"
                clearable
            ></el-input>
        </el-form-item>
    </el-form>
</template>

