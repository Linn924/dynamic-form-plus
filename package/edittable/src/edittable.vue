<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { validateExtra, parsedFormRule, deepJudge, ruleHandler } from '~/tools'
import type { IProvideForm, IFormData } from '@/form'

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
const defTableRowValue = {}
props.opt.formdata.forEach((item: IFormData) => {
    if (item.ysj_bxxs !== 'button') {
        defTableRowValue[item.zmbm] = item.ysj_zdmrz || '' //取出表单所有属性和值
    }
})
const formRef = ref<FormInstance>() //组件内部el-form
const defaultTableRowValue = ref(defTableRowValue) //新增行的默认数据
const tableList = ref<any>([]) //列表数据（不包含未保存的修改）
const formValue = ref({
    modifyRow: null, //编辑行数据
    newRow: JSON.parse(JSON.stringify(defaultTableRowValue.value)) //新增行数据
})
const modifyRowIdx = ref(-1) //正在编辑的行索引，计算属性中需要根据 modifyRowIdx 判断要换位的数据

//接口：校验方法
const validate = () => {
    let isSuccess = false
    if (!validateExtra(props.opt.ysj_cd, tableList.value)) {
        setTimeout(() => {
            ElMessage.error(`${props.opt.zmmc}不符合配置数据范围`)
        }, 0)
        return false
    }
    //只需校验正在编辑的行即可
    validateForm('modifyRow', () => {
        isSuccess = true
    })
    return isSuccess
}
//事件：click事件
const handleClick = (type: string, data?: any) => {
    switch (type) {
        case 'saveNew': //新增一行
            //验证新增行
            validateForm('newRow', () => {
                tableList.value.push(formValue.value.newRow) //新增行加到数据列表
                resetNewRow()
                emits('value-change', props.opt.zmbm, tableList.value)
            })
            break
        case 'modify': //修改某行
            if (modifyRowIdx.value !== -1) {
                //其他行正在修改
                ElMessage.info('请先完成修改的行')
            } else {
                //拷贝当前行数据到表单对象
                formValue.value.modifyRow = JSON.parse(JSON.stringify(data.row)) //修改行应用到数据列表
                modifyRowIdx.value = data.$index
            }
            break
        case 'delete': //删除某行
            tableList.value.splice(data.$index, 1)
            emits('value-change', props.opt.zmbm, tableList.value)
            if (modifyRowIdx.value !== -1 && data.$index < modifyRowIdx.value) {
                //删除行在修改行之前，修改行索引需要减1
                modifyRowIdx.value -= 1
            }
            //编辑状态不提供删除操作，因此不需要判断当前修改行被删除的情况
            break
        case 'saveModify': //保存此行
            //验证修改行
            validateForm('modifyRow', () => {
                tableList.value.splice(modifyRowIdx.value, 1, formValue.value.modifyRow)
                formValue.value.modifyRow = null
                modifyRowIdx.value = -1
                emits('value-change', props.opt.zmbm, tableList.value)
            })
            break
        case 'cancelModify': //取消编辑
            formValue.value.modifyRow = null
            modifyRowIdx.value = -1
            break
    }
}
//事件：子项值发生改变
const itemValueChange = (type: string, [zmbm, value]: [string, any]) => {
    if (formValue.value[type]) {
        formValue.value[type][zmbm] = value
    }
}
//事件：事件触发
const eventEmit = (index: number, opt: any) => {
    emits('event-emit', {
        $index: index,
        ...opt
    })
}
//方法：重置新增行数据
const resetNewRow = () => {
    formValue.value.newRow = JSON.parse(JSON.stringify(defTableRowValue))
}
//方法：保存前验证当前编辑数据
const validateForm = async (type: string, callback: () => void) => {
    let isSuccess = true
    //验证指定状态的表单的数据
    await formRef.value?.validateField(validateFields.value[type], (isVaild: boolean) => {
        isSuccess = isVaild
    })
    if (isSuccess) {
        callback?.()
    }
}
//方法：获取验证规则
const getFormItemRules = (opt: IFormData, index: number) => {
    return (
        (opt.designer_rule
            ? ruleHandler(opt.designer_rule, form?.value.value, index)
            : rules.value[opt.zmbm]) || []
    )
}

//计算属性：当前控件是否被禁用
const isCompDisabled = computed(() => {
    return typeof props.sfzd === 'boolean'
        ? props.sfzd
        : props.opt.sfzd === '1' || props.mode !== 'edit'
})
//计算属性：校验规则
const rules = computed<FormRules>(() => {
    let rules = {}
    if (!isCompDisabled.value) {
        props.opt.formdata.forEach((item: IFormData) => {
            rules[item.zmbm] = parsedFormRule(item, props.rules) //解析验证规则
        })
    }
    return rules
})
//计算属性：计算需要校验的字段
const validateFields = computed(() => {
    const modifyRow: any = [],
        newRow: any = []
    Object.keys(rules.value).forEach((field: string) => {
        modifyRow.push('modifyRow.' + field)
        newRow.push('newRow.' + field)
    })
    return {
        modifyRow,
        newRow
    }
})
//计算属性：列表实际显示的数据
const tableListView = computed(() => {
    const tableListView = [
        ...tableList.value,
        ...(isCompDisabled.value ? [] : [{ _edittableRowtype: 'newRow' }])
    ]
    if (modifyRowIdx.value !== -1) {
        //若有修改行，则将显示数组中的数据替换为占位行（实际编辑数据为：oEdittableForm.modifyRow）
        tableListView[modifyRowIdx.value] = { _edittableRowtype: 'modifyRow' }
    }
    return tableListView
})

//监听：将表单传入的值赋值给控件v-model绑定的值
watch(
    () => props.value,
    val => {
        resetNewRow()
        tableList.value = val ? JSON.parse(JSON.stringify(val)) : []
    },
    {
        immediate: true
    }
)

//暴露方法
defineExpose({
    validate
})

//定义组件名称
defineOptions({
    name: 'DyEdittable'
})
</script>

<template>
    <el-form
        class="dyform-edittable"
        ref="formRef"
        label-width="0"
        :validate-on-rule-change="false"
        :model="formValue"
    >
        <el-table
            class="dyform-table"
            :class="isCompDisabled ? '_view' : '_edit'"
            :data="tableListView"
            stripe
        >
            <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
            <template v-for="(opt, index) in props.opt.formdata">
                <template v-if="deepJudge(opt, props.opt.formdata, props.value, 'monomer', form)">
                    <el-table-column :key="index" :prop="opt.zmbm" :label="opt.zmmc" align="center">
                        <template #default="{ row, $index }">
                            <!-- 新增/修改 -->
                            <el-form-item
                                v-if="row._edittableRowtype"
                                :prop="row._edittableRowtype + `.${opt.zmbm}`"
                                :rules="getFormItemRules(opt, $index)"
                            >
                                <component
                                    :is="`dy-${opt.ysj_bxxs}`"
                                    :mode="props.mode"
                                    :opt="opt"
                                    :sfzd="props.sfzd || opt._prj_disabled"
                                    :value="formValue[row._edittableRowtype][opt.zmbm]"
                                    :item="formValue[row._edittableRowtype]"
                                    @value-change="
                                        (zmbm:string, value:any) => {
                                            itemValueChange(row._edittableRowtype, [zmbm, value])
                                        }
                                    "
                                    @event-emit="(opt:any) => {
                                        eventEmit($index, opt)
                                    }"
                                ></component>
                            </el-form-item>
                            <!-- 查看 -->
                            <component
                                v-else
                                :is="`dy-${opt.ysj_bxxs}`"
                                mode="readonly"
                                :opt="opt"
                                :sfzd="props.sfzd || opt._prj_disabled"
                                :value="row[opt.zmbm]"
                            ></component>
                        </template>
                    </el-table-column>
                </template>
            </template>
            <el-table-column label="操作" align="center" v-if="!isCompDisabled">
                <template #default="item">
                    <el-form-item>
                        <!-- 新增状态 -->
                        <el-button
                            v-if="item.row._edittableRowtype === 'newRow'"
                            @click="handleClick('saveNew', item)"
                        >
                            保存
                        </el-button>
                        <!-- 修改状态 -->
                        <template v-else-if="item.row._edittableRowtype === 'modifyRow'">
                            <el-button @click="handleClick('saveModify', item)">保存</el-button>
                            <el-button
                                plain
                                type="danger"
                                @click="handleClick('cancelModify', item)"
                            >
                                取消
                            </el-button>
                        </template>
                        <!-- 查看状态 -->
                        <template v-else>
                            <el-button @click="handleClick('modify', item)">修改</el-button>
                            <el-button plain type="danger" @click="handleClick('delete', item)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-form-item>
                </template>
            </el-table-column>
        </el-table>
    </el-form>
</template>

