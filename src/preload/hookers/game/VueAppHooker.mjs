import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { waitForElm } from '../../dom-utils.mjs'
import { waitForProperty } from '../../object-utils.mjs'
import { onMutation, onceMutation } from '../../vuex-utils.mjs'
import * as log from '../../log.mjs'
import * as objectUtils from '../../object-utils.mjs'

export class VueAppHooker extends Hooker {
  constructor() {
    super()
    this._vueApp = null
    this._events = new EventEmitter()
    this._state = null
  }

  hook() {
    const domApi = this.pimp.getApi('dom')

    domApi.on('bodyAvailable', async () => {
      let app = await waitForElm('app')
      this._vueApp = await waitForProperty(app, '__vue_app__')
      log.info('VueApp', 'Found Vue app instance.')
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

        getModuleState: (name) => {
          if (this._state === null) {
            this._state = this.lookForStateProvider().state
          }

          return this._state.value[name]
        },

        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
    this._events.removeAllListeners()
  }

  lookForStateProvider() {
    for (let [key, value] of objectUtils.allKeyValues(this._vueApp._context.provides)) {
      if (value.state) {
        // Found it!
        return value
      }
    }
  }
}
