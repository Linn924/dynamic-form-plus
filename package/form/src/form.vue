<script lang="ts">
export default {
    name: 'DyForm'
}
</script>
<script setup lang="ts">
import { ref, computed, provide, inject, nextTick } from 'vue'
import axios from 'axios'
import {
    DyFormItem,
    IFormData,
    IGroupData,
    IFzData,
    IExpendObj,
    IExpendGruoupObj,
    IDynamicOpts,
    IDynamicPlus
} from '@/form'
import { parseOpts, deepJudge, getRelValidateOpt } from '~/tools'
import { generateGuid } from '~/wiv'
import type { FormInstance } from 'element-plus'

const $DyFormPlus = inject<IDynamicPlus>('$DyFormPlus') //注入动态表单提供的方法
const props = defineProps({
    //获取表单配置时的参数 不响应变化
    args: {
        type: Object,
        default: () => ({})
    },
    //表单model绑定的值 响应变化
    value: {
        type: Object,
        default: () => ({})
    },
    //传入的自定义验证规则 不响应变化
    rules: {
        type: Object,
        default: () => ({})
    },
    //表单状态 edit/view/readonly 编辑/查看/只读 响应变化
    mode: {
        type: String,
        default: 'readonly'
    },
    //当前场景 PC端还是移动端
    scene: String,
    //表单项名称的默认宽度
    labelWidth: {
        type: String,
        default: '120px'
    },
    //传入的省市区等数据 响应变化
    cityData: {
        type: Array,
        default: () => []
    },
    //传入的字典请求地址
    dictUrl: String,
    //指定 cascader 中使用额外的数据属性名后缀，若定义此字段，则表单中所有 区划级联 cascader 的控件，保存时自动添加一个属性为 zmbm+后缀，其中保存选中内容的字符串拼接结果。
    cityZmbmSuffix: String,
    //应用配置前执行的自定义方法
    beforeApplyOpts: Function,
    //上传接口返回数据的处理方法，将覆写全局配置中传入的 handleUploadResult
    handleUploadResult: Function,
    //tab、anchor（依赖 ant-design 中的 anchor）
    tabType: {
        type: String,
        default: 'tab'
    },
    //对应 a-anchor offset-top
    anchorOffsetTop: Number,
    //若支持滚动导航，则传入方法获取内容块滚动容器（出现滚动条的容器），默认为分组容器
    getAnchorContainer: {
        type: Function //示例：:get-anchor-container="()=>$refs.anchorContainer"
        //说明：通过方法获取滚动容器，而不直接接受 HTMLElement 类型的数据，以避免使用时，在页面 data 中获取 dom 时，vue 实例可能还未挂载完成，导致获取到 null
    }
})
const emits = defineEmits(['update:value', 'event-emit'])

//变量
const dictUrl = props.dictUrl || $DyFormPlus?.dictUrl //当前字典请求的地址
const mapZmbm = new Map() //zmbm->tabbm 键值对
const dyformRef = ref<FormInstance>() //最外层el-form组件
const dyformitemRef = ref<any>() //内层el-form-item子组件
const anchorIdPre = ref(generateGuid() + '_') //生成滚动导航id前缀，避免单页项目中与其他组件中的id重名，导致滚动异常
const activeTab = ref('') //当前默认选中第一个tab
const formdata = ref<IFormData[]>([]) //处理后的formdata
const groupdata = ref<IGroupData[]>([]) //处理后的groupdata
const isDyformShow = ref(true) //组件重新渲染手动控制

//计算属性：绘制到模板中的tab及分组
const tabsComputed = computed(() => {
    const tabs = JSON.parse(JSON.stringify(groupdata.value)) || []
    const tabsComputed: IGroupData[] = []
    tabs.forEach((tab: IGroupData) => {
        if (typeof tab._prj_visible === 'boolean' ? tab._prj_visible : true) {
            //一级分组展示时判断二级分组显示状态
            tab.fzlist = tab.fzlist.filter((fz: IFzData) => {
                return typeof fz._prj_visible === 'boolean' ? fz._prj_visible : true
            })
            tabsComputed.push(tab)
        }
    })
    return tabsComputed
})

//接口：获取配置项，并且初始化
const reset = (oYwData = {}, oOpts: IDynamicOpts) => {
    //调用多次fReset时，dynamicform组件未销毁，会出现问题（组件未销毁会导致卡片数据处理问题），加入bIsDynamicForm标识以销毁组件
    isDyformShow.value = false
    const applyOpts = (oOpts: IDynamicOpts) => {
        formdata.value = oOpts.formdata || []
        groupdata.value = oOpts.groupdata || []
        handleOpts(oYwData) //处理配置项
    }
    if (oOpts) {
        //传入配置，不需要发内置请求
        //传入 oOpts 将导致 beforeApplyOpts 失效，调用前请将配置数据处理后再传入
        setTimeout(() => {
            isDyformShow.value = true
            nextTick(() => {
                applyOpts(oOpts)
            })
        }, 0)
    } else {
        axios({
            method: 'post',
            url: $DyFormPlus?.formOptsUrl,
            data: props.args
        }).then(({ data: oOriOpts }) => {
            isDyformShow.value = true
            nextTick(() => {
                oOriOpts = oOriOpts.data || {}
                //请求成功后，如果有配置自定义方法就调用配置自定义方法，获取扩展后的配置项
                props.beforeApplyOpts
                    ? props.beforeApplyOpts(oOriOpts, () => applyOpts(oOriOpts)) //此函数将直接处理 oOriOpts
                    : applyOpts(oOriOpts)
            })
        })
    }
}
//接口：修改表单项
const resetOpts = (opts: IExpendObj) => {
    formdata.value = $DyFormPlus?.resetOpts(formdata.value, opts)
}
//接口：修改tab和fz配置项
const resetGroupOpts = (opts: IExpendGruoupObj) => {
    groupdata.value = $DyFormPlus?.resetGroupOpts(groupdata.value, opts)
}
//接口：表单验证(深层)
const validate = async (callback: (isValid: boolean) => void) => {
    let failedZmbm: string[] = [] //验证未通过的表单项zmbm
    let isSuccess = true
    let failedTab = '' //验证失败表单项所在tab
    //校验普通表单项
    await dyformRef.value?.validate((isValid: boolean, obj: any) => {
        isSuccess = isValid
        isSuccess || failedZmbm.push(...Object.keys(obj))
    })
    //校验单体项(级联等)
    dyformitemRef.value &&
        dyformitemRef.value.forEach((dyformitem: any) => {
            const isValid = dyformitem.validate()
            if (!isValid) {
                isSuccess = false
                failedZmbm.push(dyformitem.opt.zmbm)
            }
        })
    if (!isSuccess) {
        if (props.tabType === 'tab' && tabsComputed.value.length > 1) {
            failedTab = searchTabbmByZmbm(failedZmbm)
            if (failedTab) {
                activeTab.value = failedTab
            }
        }
        nextTick(() => {
            const domError = document.querySelector('.el-form-item__error')
            if (domError) {
                domError.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }
        })
    }
    if (callback) {
        callback(isSuccess)
    } else {
        return new Promise((resolve, reject) => {
            if (isSuccess) {
                resolve(true)
            } else {
                reject(false)
            }
        })
    }
}
//事件：tab：滚动导航，滚动导航项点击
const anchorClick = (e: MouseEvent) => {
    //阻止默认操作，防止地址栏内容被修改，导致 url 参数丢失
    e.preventDefault()
}
//方法：接收控件绑定的最新值，后将最新的表单对象抛到页面中（获取最新的form表单信息）
const valueChange = (sKey: string, value: any) => {
    setFormValue(sKey, value)
}
//方法：接收控件抛出的自定义事件，后将自定义事件抛到页面中（获取配置对象，事件类型，事件对象）
const eventEmit = (args: any) => {
    const { opt, type } = args
    let fun = ''
    if (opt.designer_event && opt.designer_event[type]) {
        //处理个性化事件（来源：表单设计器）
        fun = opt.designer_event[type]
        setTimeout(() => {
            eval(`(${fun})`)
        }, 0)
    }
    emits('event-emit', args)
}
//方法：处理配置项
const handleOpts = (oYwData: any) => {
    const { oOptValue, aFormData } = parseOpts({
        opts: formdata.value,
        mode: props.mode,
        rules: props.rules,
        scene: props.scene
    })
    const mapFzbm = new Map()
    tabsComputed.value.forEach((tab, nIdx) => {
        tab.fzlist &&
            tab.fzlist.forEach(fz => {
                mapFzbm.set(fz.fzbm, {
                    tabbm: tab.tabbm,
                    $index: nIdx
                })
            })
    })
    aFormData.forEach((oOpt: IFormData) => {
        mapZmbm.set(oOpt.zmbm, mapFzbm.get(oOpt.fzbm)) //获取zmbm->tabbm键值对
    })
    activeTab.value = groupdata.value[0]?.tabbm ?? '' //当前tab页
    formdata.value = aFormData || []
    emits('update:value', {
        //将合并完的表单对象抛到页面中
        ...oOptValue,
        ...oYwData
    })
}
//方法：设置表单项的值
const setFormValue = (sKey: string, value: any) => {
    //值变化引起多个控件隐藏时，每个控件都会触发 value-change 并将该控件的数据置空。在页面模板再次渲染前，props.value 不会变化，导致只有最后一个控件成功置空
    //setTimeout 使得每次触发 value-change 前都先完成页面的模板渲染，使 props.value 保持最新
    setTimeout(() => {
        emits('update:value', {
            ...props.value,
            [sKey]: value
        })
    }, 0)
}
//方法：tab：滚动导航，获取内容块滚动容器
const getAnchorContainerDefault = () => {
    const container = ref()
    return container
}
//方法：判断当前控件是否只读
const judgeSfzd = (tab: any, group: any, opt: any) => {
    //当前表单项的_prj_disabled的可作用的值的类型是Array或者Boolean
    return typeof opt === 'boolean' || typeof opt === 'object'
        ? opt
        : typeof group === 'boolean'
        ? group
        : typeof tab === 'boolean'
        ? tab
        : ''
}
//方法：根据zmbm查找tabbm
const searchTabbmByZmbm = (arr: string[]) => {
    let isExist = false
    arr.some((zmbm: string) => {
        if (mapZmbm.get(zmbm).tabbm === activeTab.value) {
            isExist = true
            return true
        }
    })
    if (isExist) {
        return null
    } else {
        arr.sort(
            (zmbmA: string, zmbmB: string) => mapZmbm.get(zmbmA).$index - mapZmbm.get(zmbmB).$index
        )
        return mapZmbm.get(arr[0]).tabbm
    }
}

//依赖注入
provide(
    'form',
    computed(() => {
        return {
            mode: props.mode,
            scene: props.scene,
            dictUrl,
            cityData: props.cityData,
            cityZmbmSuffix: props.cityZmbmSuffix,
            value: props.value,
            handleUploadResult: props.handleUploadResult,
            labelWidth: props.labelWidth
        }
    })
)
//定义组件名称
//defineOptions({
//    name: 'DyForm'
//})
//暴露变量及方法
defineExpose({
    reset,
    resetOpts,
    resetGroupOpts,
    validate
})
</script>

<template>
    <el-form
        ref="dyformRef"
        class="dyform"
        v-if="isDyformShow"
        :label-position="props.scene === 'mobile' ? 'top' : 'right'"
        :label-width="props.labelWidth"
        :model="props.value"
        :validate-on-rule-change="false"
    >
        <!-- 一级分组：滚动导航或 tab 切换 -->
        <template v-if="tabsComputed.length > 1">
            <!-- 顶部tab页 -->
            <div v-if="props.tabType === 'tab'" class="dyform-tabs">
                <div
                    class="dyform-tab"
                    v-for="(oTab, nIndex) in tabsComputed"
                    :key="'tab' + nIndex"
                    :class="{ _active: oTab.tabbm === activeTab }"
                    @click="activeTab = oTab.tabbm"
                >
                    <slot name="tabitem" :oTab="oTab">
                        {{ oTab.tabmc }}
                    </slot>
                </div>
            </div>
            <!-- 滚动导航 -->
            <a-anchor
                class="dyform-anchor"
                v-else-if="props.tabType === 'anchor'"
                :offset-top="props.anchorOffsetTop"
                @click="anchorClick"
                :getContainer="props.getAnchorContainer || getAnchorContainerDefault"
                :affix="false"
            >
                <a-anchor-link
                    class="dyform-anchor-link"
                    v-for="(oTab, nIndex) in tabsComputed"
                    :key="'tab' + nIndex"
                    :href="'#' + anchorIdPre + oTab.tabbm"
                >
                    <slot name="tabitem" :oTab="oTab">
                        {{ oTab.tabmc }}
                    </slot>
                </a-anchor-link>
            </a-anchor>
        </template>

        <!--主题分组、表单-->
        <div class="dyform-grouplist" ref="container">
            <!-- 表单数据需要保留，切换一级分组时，不应该销毁控件，因此不能使用 v-if -->
            <div
                class="dyform-tabgroup"
                v-for="(oTab, nIndex) in tabsComputed"
                v-show="props.tabType === 'anchor' || oTab.tabbm === activeTab"
                :key="'tab' + nIndex"
                :id="anchorIdPre + oTab.tabbm"
            >
                <!-- 默认至在支持滚动导航时显示 tab 名称。如需隐藏，则在项目中修改样式 -->
                <div class="dyform-tabgroup-name" v-show="props.tabType === 'anchor'">
                    {{ oTab.tabbm }}
                </div>

                <div class="dyform-tabgroup-cont">
                    <!-- 隐藏分组时，分组中的控件数据不需要保留，因此需要销毁，不能用 v-show -->
                    <div
                        class="dyform-group-box"
                        v-for="oGroup in oTab.fzlist"
                        :key="'fz' + oGroup.fzbm"
                    >
                        <!--分组名称-->
                        <slot name="fzmc" :fz="oGroup">
                            <div class="dyform-group-title" v-if="oGroup.ysj_sfycmc !== '1'">
                                {{ oGroup.fzmc }}
                            </div>
                        </slot>

                        <el-row class="dyform-group-cont">
                            <template v-for="(oOpt, nIdx) in formdata">
                                <template v-if="oOpt.fzbm === oGroup.fzbm">
                                    <el-col
                                        v-if="deepJudge(oOpt, formdata, props.value)"
                                        :key="oOpt.id"
                                        :span="oOpt.dynamicform_tdcols"
                                        :class="{
                                            'dyform-clearleft':
                                                oOpt.zwcols === '1' || oOpt.dynamicform_linefeed
                                        }"
                                    >
                                        <dy-form-item
                                            :opt="getRelValidateOpt(oOpt, props.value, nIdx)"
                                            ref="dyformitemRef"
                                            :prop="oOpt.zmbm"
                                            :rules="props.rules[oOpt.zmbm]"
                                            :value="props.value[oOpt.zmbm]"
                                            :sfzd="
                                                judgeSfzd(
                                                    oTab._prj_disabled,
                                                    oGroup._prj_disabled,
                                                    oOpt._prj_disabled
                                                )
                                            "
                                            @value-change="valueChange"
                                            @event-emit="eventEmit"
                                        ></dy-form-item>
                                    </el-col>
                                </template>
                            </template>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>
    </el-form>
</template>

