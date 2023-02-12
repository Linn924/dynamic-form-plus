import UploadPicture from './src/upload-picture.vue'
import { App } from 'vue'

UploadPicture.install = (app: App): void => {
    app.component(UploadPicture.name, UploadPicture)
}

export * from './types'

export default UploadPicture
