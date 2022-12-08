import EventEmitter from 'eventemitter3'
import * as log from '../../log.mjs'

export class MysteryObjectHooker {
  constructor() {
    this._thatMysteryObject = null
  }

  hook(pimp) {
    let events = new EventEmitter()

    events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._thatMysteryObject) {
          // Already available. Call it.
          listener(this._thatMysteryObject)
        }
      }
    })

    let self = this

    Object.defineProperty(window, 'mWnwM', {
      configurable: false,
      set(v) {
        if (self._thatMysteryObject) {
          log.warn('MysteryObject', 'Caught mystery object again')
          return
        }

        log.info('MysteryObject', 'Caught mystery object')

        self._thatMysteryObject = v

        this._superUniqueProperty = v

        events.emit('available', self._thatMysteryObject)
      },
      get() {
        return this._superUniqueProperty
      }
    })

    return {
      name: 'mystery',
      api: {
        getMysteryObject: () => this._thatMysteryObject,
        on: events.on.bind(events),
        off: events.off.bind(events)
      }
    }
  }

  unhook(pimp) {
  }
}