import Edittable from './src/edittable.vue'
import { App } from 'vue'

Edittable.install = (app: App): void => {
    app.component(Edittable.name, Edittable)
}

export * from './types'

export default Edittable
