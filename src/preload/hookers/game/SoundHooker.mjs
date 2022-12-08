import EventEmitter from 'eventemitter3'
import * as log from '../../log.mjs'

export class SoundHooker {
  constructor() {
    this._events = new EventEmitter()
  }

  hook(pimp) {
    let vueAppApi = pimp.getApi('vueApp')

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

  unhook(pimp) {
  }
}
