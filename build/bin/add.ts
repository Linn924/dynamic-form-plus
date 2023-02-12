import path from 'path'
import fsExtra from 'fs-extra'
import uppercamelcase from 'uppercamelcase'

//监听exit事件，在进程退出前进行操作
process.on('exit', code => {
    if (code === 1) {
        console.log('\x1B[31m%s\x1B[0m', '请指定组件名')
    } else if (code === 2) {
        console.log('\x1B[31m%s\x1B[0m', '组件已存在')
    }
})

const compName = process.argv[2] //输入的命令参数
!compName && process.exit(1) //未输入组件名称

const listPath = path.resolve(process.cwd(), './package/list.json') //组件清单路径
const comps = JSON.parse(fsExtra.readFileSync(listPath, 'utf-8')) //组件清单数据
comps[compName] && process.exit(2) //组件名重复
comps[compName] = `package/${compName}`

const compPath = path.resolve(process.cwd(), './package', compName) //组件的src路径
const CompName = uppercamelcase(compName) //驼峰式命名
const files = [
    //创建组件入口
    {
        filename: 'index.ts',
        content: `import ${CompName} from './src/${compName}.vue'
import { App } from 'vue'

${CompName}.install = (app: App): void => {
    app.component(${CompName}.name, ${CompName})
}

export * from './types'

export default ${CompName}
        `
    },
    //创建组件类型
    {
        filename: 'types.ts',
        content: `export {}`
    },
    //创建组件
    {
        filename: `src/${compName}.vue`,
        content: `<script lang="ts">
export default {
    name: 'Dy${uppercamelcase(compName)}'
}
</script>
<script setup lang="ts">
</script>

<template>
    <div class="dyform-${compName}"></div>
</template>
        `
    }
]

fsExtra.writeFile(listPath, JSON.stringify(comps, null, '\0'), err => {}) //添加新组件到组件清单
files.forEach(file => {
    //创建 package
    fsExtra.outputFile(path.join(compPath, file.filename), file.content, err => {})
})

console.log('[build add] DONE!')
