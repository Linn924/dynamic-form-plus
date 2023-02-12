import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import defineOptions from 'unplugin-vue-define-options/dist/vite'

export default defineConfig({
    plugins: [
        vue({
            include: [/\.vue$/]
        }),
        defineOptions()
    ],
    resolve: {
        alias: {
            '~': resolve(__dirname, '../utils'),
            '@': resolve(__dirname, '../package')
        }
    }
})
