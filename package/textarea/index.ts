import Textarea from './src/textarea.vue'
import { App } from 'vue'

Textarea.install = (app: App): void => {
    app.component(Textarea.name, Textarea)
}

export * from './types'

export default Textarea
