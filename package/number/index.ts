import Number from './src/number.vue'
import { App } from 'vue'

Number.install = (app: App): void => {
    app.component(Number.name, Number)
}

export * from './types'

export default Number
