import Text from './src/text.vue'
import { App } from 'vue'

Text.install = (app: App): void => {
    app.component(Text.name, Text)
}

export * from './types'

export default Text
