import Button from './src/button.vue'
import { App } from 'vue'

Button.install = (app: App): void => {
    app.component(Button.name, Button)
}

export * from './types'

export default Button

