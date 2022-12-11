import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'

export class SoundHooker extends Hooker {
  constructor() {
    super()
    this._events = new EventEmitter()
  }

  hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    return {
      name: 'sound',
      api: {
        playSound: ({ name }) => {
          log.info('Sound', `Playing sound: ${name}`)
          return vueAppApi.getVueApp().$store.dispatch('sounds/playSound')
        },
        startAmbient: ({ name }) => {
          // TODO
          return vueAppApi.getVueApp().$store.dispatch('sounds/startAmbient', name)
        },
        stopAmbient: ({ name }) => {
          return vueAppApi.getVueApp().$store.dispatch('sounds/stopAmbient', name)
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook() {
  }
}