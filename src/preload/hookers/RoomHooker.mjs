import EventEmitter from 'eventemitter3'
import { waitForProperty } from '../object-utils.mjs'

class State {
  available(game) {}
}

class StateUnknown extends State {
  constructor(hooker) {
    super()
    this.hooker = hooker
  }

  available(game) {
    this.hooker._game = game
    this.hooker._state = new StateWaitingForRoom(this.hooker)
  }
}

class StateWaitingForRoom extends State {
  constructor(hooker) {
    super()
    this.hooker = hooker

    if (this.hooker._game.room) {
      // Already has room.
      this.hooker._currentRoom = this.hooker._game.room
      this.hooker._state = new StateInRoom(this.hooker)
    } else {
      (async () => {
        console.log('Will be waiting for room')
        try {
          this.hooker._currentRoom = await waitForProperty(this.hooker._game, 'room', {
            nullable: false
          })
          this.hooker._state = new StateInRoom(this.hooker)
        } catch (e) {
          console.error(e)
        }
      })()
    }
  }
}

class StateInRoom extends State {
  constructor(hooker) {
    super()
    this.hooker = hooker

    console.log('Found room')

    this.hooker._events.emit('joined', { room: this.hooker._currentRoom })

    {
      (async () => {
        console.log('Will be waiting for room to be removed')
        try {
          await waitForProperty(this.hooker._game, 'room', {
            accept(value) { return value === null }
          })

          this.hooker._currentRoom = null

          this.hooker._events.emit('leaved', { room: this.hooker._currentRoom })

          this.hooker._state = new StateWaitingForRoom(this.hooker)
        } catch (e) {
          console.error(e)
        }
      })()
    }
  }
}

export class RoomHooker {
  constructor() {
    this._game = null
    this._currentRoom = null
    this._state = new StateUnknown(this)
    this._events = new EventEmitter()
  }

  hook(pimp) {
    let vueAppApi = pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      this._state.available(vueAppApi.getGameObject())
    })

    this._events.on('newListener', (name, listener) => {
      if (name === 'joined') {
        if (this._currentRoom) {
          // Already joined. Call it.
          listener({ room: this._currentRoom })
        }
      }
    })

    return {
      name: 'room',
      api: {
        getRoom: () => {
          return this._currentRoom
        },
        getPlayerBySessionId: (sessionId) => {
          // TODO
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
  }
}
