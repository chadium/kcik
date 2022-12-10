import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { waitForElm } from '../../dom-utils.mjs'
import { waitForProperty } from '../../object-utils.mjs'

export class VueAppHooker extends Hooker {
  constructor() {
    super()
    this._vueApp = null
    this._events = new EventEmitter()
  }

  hook() {
    const domApi = this.pimp.getApi('dom')

    domApi.on('bodyAvailable', async () => {
      let app = await waitForElm('app')
      this._vueApp = await waitForProperty(app, '__vue__')
      this._events.emit('available', this._vueApp)
    })

    this._events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._vueApp !== null) {
          // Already available. Call it.
          listener(this._vueApp)
        }
      }
    })

    return {
      name: 'vueApp',
      api: {
        getVueApp: () => this._vueApp,
        getGameObject: () => this._vueApp.$store.state.game,
        getUserObject: () => this._vueApp.$store.state.user,
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
    this._events.removeAllListeners()
  }
}
