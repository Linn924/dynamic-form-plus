import Form from './src/form.vue'
import FormItem from './src/form-item.vue'
import { App } from 'vue'

Form.install = (app: App): void => {
    app.component(Form.name, Form)
}

export * from './types'

export { FormItem as DyFormItem }

export default Form

