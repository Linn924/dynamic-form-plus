import Upload from './src/upload.vue'
import { App } from 'vue'

Upload.install = (app: App): void => {
    app.component(Upload.name, Upload)
}

export * from './types'

export default Upload
