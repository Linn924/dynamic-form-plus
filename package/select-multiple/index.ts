import SelectMultiple from './src/select-multiple.vue'
import { App } from 'vue'

SelectMultiple.install = (app: App): void => {
    app.component(SelectMultiple.name, SelectMultiple)
}

export * from './types'

export default SelectMultiple
