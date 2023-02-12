import { App } from 'vue'
import config from '../package.json'
import utils from '../utils'
import '../theme/index.less'
import { Anchor } from 'ant-design-vue' //按需导入 ant-design 中的组件
import Button from './button'
import Form from './form'
import Input from './input'
import Text from './text'
import Textarea from './textarea'
import Cascader from './cascader'
import Checkbox from './checkbox'
import Date from './date'
import Editcard from './editcard'
import Edittable from './edittable'
import Number from './number'
import Radio from './radio'
import Select from './select'
import SelectMultiple from './select-multiple'
import TemplateValue from './template-value'
import Upload from './upload'
import UploadPicture from './upload-picture'
import UploadText from './upload-text'

const comps = [
    Button,
    Form,
    Input,
    Text,
    Textarea,
    Cascader,
    Checkbox,
    Date,
    Editcard,
    Edittable,
    Number,
    Radio,
    Select,
    SelectMultiple,
    TemplateValue,
    Upload,
    UploadPicture,
    UploadText
]

const install = (app: App, opts: any = {}): void => {
    comps.forEach(comp => {
        app.component(comp.name, comp)
    })
    app.use(Anchor)
    app.provide('$DyFormPlus', {
        formOptsUrl: opts.formOptsUrl || '', // 表单配置请求地址
        uploadUrl: opts.uploadUrl || '', // 文件上传地址
        previewUrl: opts.previewUrl || '', // 文件预览地址
        dictUrl: opts.dictUrl || '', //字典list地址
        getUploadHeaders: opts.getUploadHeaders, //获取项目中的自定义 headers
        handleUploadResult: opts.handleUploadResult, //上传接口返回数据的处理方法
        ...utils // 动态表单提供的方法
    })
}

const Window: any = window
if (typeof Window !== 'undefined' && Window.Vue) {
    install(Window.Vue)
}

export default {
    version: config.version,
    install
}

