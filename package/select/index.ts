import Select from './src/select.vue'
import SelectSuggest from './src/select-suggest.vue'
import { App } from 'vue'

Select.install = (app: App): void => {
    app.component(Select.name, Select)
}

export * from './types'

export { SelectSuggest }

export default Select

