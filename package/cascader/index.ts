import Cascader from './src/cascader.vue'
import { App } from 'vue'

Cascader.install = (app: App): void => {
    app.component(Cascader.name, Cascader)
}

export * from './types'

export default Cascader
