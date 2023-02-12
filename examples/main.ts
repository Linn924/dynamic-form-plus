import { createApp } from 'vue'
import App from './App.vue'

import 'element-plus/theme-chalk/index.css'
import ElementPlus from 'element-plus'
import * as ELementPlusIcons from '@element-plus/icons-vue'

import '../theme/index.less'
import DynamicFormPlus from '../package/index'

const app = createApp(App)
for (const [key, component] of Object.entries(ELementPlusIcons)) {
    app.component(key, component)
}

app.use(ElementPlus)
    .use(DynamicFormPlus, {
        formOptsUrl: '../public/_json/form.json', // 表单配置请求地址
        uploadUrl: '../public/_json/upload.json', // 文件上传地址
        previewUrl: 'https://www.wisoft.com.cn/r/cms/www/default/img/wisoft/wisoft_logo.png?id=', // 文件预览地址
        dictUrl: '../public/_json/list.json',
        getUploadHeaders: function () {
            //获取项目中自定义的headers
            return {}
        },
        handleUploadResult: null //上传接口返回数据的处理方法
    })
    .mount('#app')

