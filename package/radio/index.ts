import Radio from './src/radio.vue'
import { App } from 'vue'

Radio.install = (app: App): void => {
    app.component(Radio.name, Radio)
}

export * from './types'

export default Radio

