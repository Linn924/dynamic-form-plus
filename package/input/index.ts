import Input from './src/input.vue'
import InputSuggest from './src/input-suggest.vue'
import { App } from 'vue'

Input.install = (app: App): void => {
    app.component(Input.name, Input)
}

export * from './types'

export { InputSuggest }

export default Input

