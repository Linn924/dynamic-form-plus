import Checkbox from './src/checkbox.vue'
import { App } from 'vue'

Checkbox.install = (app: App): void => {
    app.component(Checkbox.name, Checkbox)
}

export * from './types'

export default Checkbox
