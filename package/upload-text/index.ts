import UploadText from './src/upload-text.vue'
import { App } from 'vue'

UploadText.install = (app: App): void => {
    app.component(UploadText.name, UploadText)
}

export * from './types'

export default UploadText
