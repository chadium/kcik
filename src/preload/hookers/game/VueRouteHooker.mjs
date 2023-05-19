import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'

export class VueRouteHooker extends Hooker {
  constructor() {
    super()
    this.route = null
    this.events = new EventEmitter()
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', (vueApp) => {
      this.route = vueApp.config.globalProperties.$route
      vueApp.config.globalProperties.$router.afterEach((route) => {
        this.route = route

        this.events.emit('navigate', {
          name: this.route.name,
          path: this.route.path
        })
      })
    })

    return {
      name: 'vueRoute',
      api: {
        getRouteName: () => {
          return this.route.name
        },

        getRoutePath: () => {
          return this.route.path
        },

        on: this.events.on.bind(this.events),
        off: this.events.off.bind(this.events),
      }
    }
  }

  async unhook() {
  }
}
