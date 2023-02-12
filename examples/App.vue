<script setup lang="ts">
import { ref, inject, watch, onMounted } from 'vue'

const $DyFormPlus: any = inject('$DyFormPlus') //注入动态表单提供的方法

//变量
const dyformRef = ref() //动态表单ref
const args = ref({}) //动态表单配置参数
const formValue = ref({}) //最终应用到表单上的对象
const formRules = ref({}) //自定义需传入的规则
const mode = ref('edit') //当前动态表单的状态

//监听：整个表单绑定值得变化
watch(
    formValue,
    val => {
        //console.log(val)
    },
    {
        deep: true
    }
)

//声明周期：组件挂载
onMounted(() => {
    dyformRef.value.reset({
        tp: [
            {
                id: '1ce9cdd586f146b6872787911a946c73',
                name: 'avatar.jpeg'
            }
        ]
    })
})

//方法：扩展配置项
const beforeApplyOpts = (opts: any, callback: any) => {
    opts.formdata = $DyFormPlus.resetOpts(opts.formdata, [
        {
            zmbm: 'comj',
            opt: {
                //filterable: '1',
                //optionList: ['积极', '拉取'],
                //optionUrl: '../public/_json/list.json',
                _prj_button: [
                    {
                        el: { plain: true, icon: 'Search' },
                        id: 'search'
                    }
                ]
            }
        },
        //{
        //    zmbm: 's1',
        //    opt: {
        //        filterable: '1',
        //        optionUrl: '../public/_json/dictList.json'
        //    }
        //},
        {
            zmbm: 'dx',
            opt: {
                filterable: '1',
                optionUrl: '../public/_json/dictList.json'
            }
        }
    ])
    callback()
}
//方法：组件事件触发
const eventEmit = (args: any) => {
    //console.log(args)
}
//方法：获取整个表单值
const getFormValue = () => {
    dyformRef.value.validate((isValid: boolean) => {
        //console.log('验证结果:', isValid)
    })
}
</script>

<template>
    <dy-form
        ref="dyformRef"
        v-model:value="formValue"
        :args="args"
        :rules="formRules"
        :mode="mode"
        :before-apply-opts="beforeApplyOpts"
        @event-emit="eventEmit"
    >
        <!-- tab 内容项 -->
        <template #tabitem="{ oTab }">
            <el-button>{{ oTab.tabmc }}</el-button>
        </template>
        <!-- 分组标题 -->
        <template #fzmc="{ fz }">
            <div class="demo-fzmc">{{ fz.fzmc }}</div>
        </template>
    </dy-form>
    <el-button type="primary" @click="getFormValue">获取表单数据</el-button>
</template>

<style lang="less">
.dyform {
    padding: 20px;
}
.demo-fzmc {
    color: #409eff;
}
.dyform-tab {
    margin-bottom: 20px;
    & + & {
        margin-left: 20px;
    }
    &._active .el-button {
        color: #409eff;
        background: #ecf5ff;
        border-color: #b3d8ff;
    }
}
.dyform-tab-def {
    padding: 8px 10px;
}
.dyform-anchor {
    position: fixed;
    top: 80px;
    background: #fff;
    z-index: 10;
    .ant-anchor {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
    }
}
.dyform-anchor-link {
    & + & {
        margin-left: 8px;
    }
}
.dyorm-anchor-link.ant-anchor-link-active {
    .el-button {
        color: #409eff;
        background: #ecf5ff;
        border-color: #b3d8ff;
    }
}
</style>

