import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import defineOptions from 'unplugin-vue-define-options/dist/vite'

export default defineConfig({
    server: {
        hmr: true //热更新
    },
    plugins: [
        vue({
            include: [/\.vue$/] //配置可编译的.vue文件
        }),
        /**
            <script lang="ts" setup>
                defineOptions({
                    name: 'DynamicButton',
                })
            </script>
         */
        defineOptions() //可以使得单文件组件声明name属性
    ],
    resolve: {
        alias: {
            //配置别名路径
            '~': resolve(__dirname, 'utils'),
            '@': resolve(__dirname, 'package')
        }
    }
})

