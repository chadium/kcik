import EventEmitter from 'eventemitter3'
import { waitForElm } from '../dom-utils.mjs'
import { waitForProperty } from '../object-utils.mjs'

export class VueAppHooker {
  constructor() {
    this._vueApp = null
  }

  hook(pimp) {
    let events = new EventEmitter()

    addEventListener('DOMContentLoaded', async (e) => {
      let app = await waitForElm('app')
      this._vueApp = await waitForProperty(app, '__vue__')
      events.emit('available', this._vueApp)
    })

    events.on('newListener', (name, listener) => {
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
        on: events.on.bind(events),
        off: events.off.bind(events),
      }
    }
  }

  unhook(pimp) {
  }
}
