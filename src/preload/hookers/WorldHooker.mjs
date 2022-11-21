import EventEmitter from 'eventemitter3'

export class WorldHooker {
  constructor() {
    this._worldObject = null
  }

  hook(pimp) {
    let events = new EventEmitter()

    events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._worldObject) {
          // Already available. Call it.
          listener(this._worldObject)
        }
      }
    })

    let self = this

    Object.defineProperty(window, 'mWnwMWorld', {
      configurable: false,
      set(v) {
        if (self._worldObject) {
          console.warn('Caught world object again')
          return
        }

        console.log('Caught world object')

        self._worldObject = v

        this._superUniqueProperty = v

        events.emit('available', self._worldObject)
      },
      get() {
        return this._superUniqueProperty
      }
    })

    return {
      name: 'world',
      api: {
        getWorld: () => this._worldObject,
        on: events.on.bind(events),
        off: events.off.bind(events)
      }
    }
  }

  unhook(pimp) {
  }
}
