import EventEmitter from 'eventemitter3'

export class RoomHooker {
  constructor() {
    this._mysteryObject = null
  }

  hook(pimp) {
    let events = new EventEmitter()

    events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._mysteryObject) {
          // Already available. Call it.
          listener(this._mysteryObject.mWnwM.room)
        }
      }
    })

    pimp.getApi('mystery').on('available', (world) => {
      this._mysteryObject = world

      events.emit('available', this._mysteryObject.mWnwM.room)
    })

    return {
      name: 'room',
      api: {
        getRoom: () => this._mysteryObject.mWnwM.room,
        getPlayerBySessionId: (sessionId) => {
          this._mysteryObject.mWnwM.room
        },
        on: events.on.bind(events),
        off: events.off.bind(events),
      }
    }
  }

  unhook(pimp) {
  }
}
