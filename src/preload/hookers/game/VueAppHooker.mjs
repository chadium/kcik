import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { waitForElm } from '../../dom-utils.mjs'
import { waitForProperty } from '../../object-utils.mjs'
import { onMutation, onceMutation } from '../../vuex-utils.mjs'
import * as log from '../../log.mjs'

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
        storeDispatch: (name, ...args) => {
          log.info('VueApp', `Dispatch ${name}`)
          return this._vueApp.$store.dispatch(name, ...args)
        },
        storeCommit: (name, ...args) => {
          log.info('VueApp', `Commit ${name}`)
          return this._vueApp.$store.commit(name, ...args)
        },
        onceMutation: (name, fn) => {
          log.info('VueApp', `Hook once into mutation ${name}`)
          return onceMutation(this._vueApp.$store, name, fn)
        },
        onMutation: (name, fn) => {
          log.info('VueApp', `Hook into mutation ${name}`)
          return onMutation(this._vueApp.$store, name, fn)
        },
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
