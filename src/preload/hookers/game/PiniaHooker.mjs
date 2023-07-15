import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'

export class PiniaHooker extends Hooker {
  constructor() {
    super()
    this.events = new EventEmitter()
    this.pinia = null
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', (vueApp) => {
      this.pinia = vueApp.config.globalProperties.$pinia
    })

    return {
      name: 'pinia',
      api: {
        getModuleState: (name) => {
          let state = this.pinia.state.value[name]

          if (state === undefined) {
            throw new Error(`Module not found: ${name}`)
          }

          return this.pinia.state.value[name]
        },

        on: this.events.on.bind(this.events),
        off: this.events.off.bind(this.events),
      }
    }
  }

  async unhook() {
  }
}
