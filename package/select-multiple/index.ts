import SelectMultiple from './src/select-multiple.vue'
import SelectMultipleSuggest from './src/select-multiple-suggest.vue'
import { App } from 'vue'

SelectMultiple.install = (app: App): void => {
    app.component(SelectMultiple.name, SelectMultiple)
}

export * from './types'

export { SelectMultipleSuggest }

export default SelectMultiple

