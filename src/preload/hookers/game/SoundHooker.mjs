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
        playSound: ({ name, volume = 1 }) => {
          log.info('Sound', `Playing sound: ${name}`)
          return vueAppApi.storeDispatch('sounds/playSound', {
            name,
            volume
          })
        },
        startAmbient: ({ name }) => {
          // TODO
          return vueAppApi.storeDispatch('sounds/startAmbient', name)
        },
        stopAmbient: ({ name }) => {
          return vueAppApi.storeDispatch('sounds/stopAmbient', name)
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook() {
  }
}
