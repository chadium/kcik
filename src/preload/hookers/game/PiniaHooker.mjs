import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as objectUtils from '../../object-utils.mjs'

export class PiniaHooker extends Hooker {
  #events = new EventEmitter()
  #pinia = null

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', async (vueApp) => {
      try {
        await objectUtils.waitForProperty(vueApp, 'config')
        await objectUtils.waitForProperty(vueApp.config.globalProperties, '$pinia')

        this.#pinia = vueApp.config.globalProperties.$pinia

        this.#events.emit('available')

        this.#events.on('newListener', (name, listener) => {
          if (name === 'available') {
            // Already available. Call it.
            listener()
          }
        })
      } catch (e) {
        log.bad('Pinia', e)
      }
    })

    return {
      name: 'pinia',
      api: {
        getModuleState: (name) => {
          let state = this.#pinia.state.value[name]

          if (state === undefined) {
            throw new Error(`Module not found: ${name}`)
          }

          return this.#pinia.state.value[name]
        },

        on: this.#events.on.bind(this.#events),
        once: this.#events.once.bind(this.#events),
        off: this.#events.off.bind(this.#events),
      }
    }
  }

  async unhook() {
  }
}
