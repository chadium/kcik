import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as objectUtils from '../../object-utils.mjs'

export class VueRouteHooker extends Hooker {
  #events = new EventEmitter()
  #route = null

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', async (vueApp) => {
      try {
        await objectUtils.waitForProperty(vueApp, 'config')
        await objectUtils.waitForProperty(vueApp.config.globalProperties, '$route')

        this.#route = vueApp.config.globalProperties.$route

        vueApp.config.globalProperties.$router.afterEach((route) => {
          this.#route = route
  
          this.#events.emit('navigate', {
            name: this.#route.name,
            path: this.#route.path
          })
        })

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
      name: 'vueRoute',
      api: {
        getRouteName: () => {
          return this.#route.name
        },

        getRoutePath: () => {
          return this.#route.path
        },

        on: this.#events.on.bind(this.#events),
        off: this.#events.off.bind(this.#events),
      }
    }
  }

  async unhook() {
  }
}
