import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as objectUtils from '../../object-utils.mjs'
import * as mapUtils from '../../map-utils.mjs'

export class PiniaHooker extends Hooker {
  #events = new EventEmitter()
  #pinia = null
  #modules = null

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', async (vueApp) => {
      try {
        await objectUtils.waitForProperty(vueApp, 'config')
        await objectUtils.waitForProperty(vueApp.config.globalProperties, '$pinia')

        this.#pinia = vueApp.config.globalProperties.$pinia

        for (let key in this.#pinia) {
          const value = this.#pinia[key]

          if (value instanceof Map) {
            this.#modules = value
            break
          }
        }

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

        waitForModule: (name) => {
          let state = this.#pinia.state.value[name]

          if (state === undefined) {
            return mapUtils.waitForSet(this.#modules, name)
              .then(() => this.#pinia.state.value[name])
          }

          return this.#pinia.state.value[name]
        },

        replaceModuleFunction: (moduleName, functionName, fn) => {
          const module = this.#modules.get(moduleName)

          if (module === undefined) {
            throw new Error('Module not found.')
          }

          const originalFunction = module[functionName]

          module[functionName] = (...args) => {
            return fn({ originalFunction, args })
          }

          module[functionName].original = originalFunction
        },

        restoreModuleFunction: (moduleName, functionName) => {
          const module = this.#modules.get(moduleName)

          if (!module[functionName].original) {
            throw new Error('Module function had not been replaced.')
          }

          module[functionName] = module[functionName].original
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
