import Date from './src/date.vue'
import { App } from 'vue'

Date.install = (app: App): void => {
    app.component(Date.name, Date)
}

export * from './types'

export default Date
