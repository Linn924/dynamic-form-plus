import path from 'path'
import fsExtra from 'fs-extra'

//监听exit事件，在进程退出前进行操作
process.on('exit', code => {
    if (code === 1) {
        console.log('\x1B[31m%s\x1B[0m', '请指定组件名')
    } else if (code === 2) {
        console.log('\x1B[31m%s\x1B[0m', '没有找到该组件')
    } else if (code === 3) {
        console.log('\x1B[31m%s\x1B[0m', '删除文件夹失败')
    }
})

const compName = process.argv[2] //输入的命令参数
!compName && process.exit(1) //未输入组件名称

const listPath = path.resolve(process.cwd(), './package/list.json') //组件清单路径
const comps = JSON.parse(fsExtra.readFileSync(listPath, 'utf-8')) //组件清单数据
!comps[compName] && process.exit(2) //该组件不存在
delete comps[compName]

fsExtra.writeFile(listPath, JSON.stringify(comps, null, '\0'), err => {}) //更新组件清单

// 删除文件夹
const deleteFolder = (path: string) => {
    var files = []
    if (fsExtra.existsSync(path)) {
        files = fsExtra.readdirSync(path)
        files.forEach((file: string) => {
            const curPath = path + '/' + file
            if (fsExtra.statSync(curPath).isDirectory()) {
                deleteFolder(curPath)
            } else {
                fsExtra.unlinkSync(curPath)
            }
        })
        try {
            fsExtra.rmdirSync(path)
        } catch (err) {
            files = fsExtra.readdirSync(path)
            process.exit(3)
        }
    }
    console.log('[build del] DONE!')
}

deleteFolder(path.resolve(process.cwd(), `./package/${compName}`))
