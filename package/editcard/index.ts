import Editcard from './src/editcard.vue'
import { App } from 'vue'

Editcard.install = (app: App): void => {
    app.component(Editcard.name, Editcard)
}

export * from './types'

export default Editcard
