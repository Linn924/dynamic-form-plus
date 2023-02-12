import path from 'path'
import fsExtra from 'fs-extra'
import uppercamelcase from 'uppercamelcase'

interface IArgs {
    include: string
    list: string
}

//组件入口
const createEntryTemplate = (arg: IArgs) => {
    return `import { App } from 'vue'
import config from '../package.json'
import utils from '../utils'
import '../theme/index.less'
import { Anchor } from 'ant-design-vue' //按需导入 ant-design 中的组件
${arg.include}

const comps = [
${arg.list}
]

const install = (app: App, opts: any = {}): void => {
    comps.forEach(comp => {
        app.component(comp.name, comp)
    })
    app.use(Anchor)
    app.provide('$DyFormPlus', {
        formOptsUrl: opts.formOptsUrl || '',// 表单配置请求地址
        uploadUrl: opts.uploadUrl || '',// 文件上传地址
        previewUrl: opts.previewUrl || '',// 文件预览地址
        dictUrl: opts.dictUrl || '', //字典list地址
        getUploadHeaders: opts.getUploadHeaders,//获取项目中的自定义 headers
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
 `
}

const fRenderEntry = (comps: any) => {
    const includeTemplate: string[] = []
    const listTemplate: string[] = []
    for (let comp in comps) {
        const name = uppercamelcase(comp)
        includeTemplate.push(`import ${name} from './${comp}'`)
        listTemplate.push(`    ${name}`)
    }
    const template = createEntryTemplate({
        include: includeTemplate.join('\r\n'),
        list: listTemplate.join(',\r\n')
    })
    fsExtra.writeFileSync(path.resolve(process.cwd(), `./package/index.ts`), template)
}

const listPath = path.resolve(process.cwd(), './package/list.json') //组件清单路径
const comps = JSON.parse(fsExtra.readFileSync(listPath, 'utf-8')) //组件清单数据
fRenderEntry(comps)

console.log('[build entry] DONE!')
