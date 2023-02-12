import baseConfig from './base.config'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    ...baseConfig,
    build: {
        outDir: 'lib', //打包出口
        emptyOutDir: true, //每次打包清空lib文件夹
        lib: {
            entry: resolve(__dirname, '../package/index.ts'), //入口
            name: 'DynamicFormPlus', //暴露的全局变量
            formats: ['es', 'umd'],
            fileName: format => `dynamic-form-plus.${format}.js` //输出的包文件名
        },
        rollupOptions: {
            // 确保外部化处理那些你不想打包进库的依赖
            external: ['vue', 'element-plus', 'ant-design-vue'],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                globals: {
                    vue: 'Vue',
                    'element-plus': 'element-plus',
                    'ant-design-vue': 'ant-design-vue'
                }
            }
        }
    },
    plugins: [...(baseConfig as any).plugins, dts()]
})
