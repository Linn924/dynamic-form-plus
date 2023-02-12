import TemplateValue from './src/template-value.vue'
import { App } from 'vue'

TemplateValue.install = (app: App): void => {
    app.component(TemplateValue.name, TemplateValue)
}

export * from './types'

export default TemplateValue
