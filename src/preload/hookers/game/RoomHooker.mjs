import EventEmitter from 'eventemitter3'
import { waitForProperty } from '../../object-utils.mjs'
import * as log from '../../log.mjs'

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
        log.info('RoomHooker', 'Will be waiting for room')
        try {
          this.hooker._currentRoom = await waitForProperty(this.hooker._game, 'room', {
            nullable: false
          })
          this.hooker._state = new StateInRoom(this.hooker)
        } catch (e) {
          log.bad('RoomHooker', e)
        }
      })()
    }
  }
}

class StateInRoom extends State {
  constructor(hooker) {
    super()
    this.hooker = hooker

    log.info('RoomHooker', 'Found room')

    this.hooker._events.emit('joined', { room: this.hooker._currentRoom })

    {
      (async () => {
        log.info('RoomHooker', 'Will be waiting for room to be removed')
        try {
          await waitForProperty(this.hooker._game, 'room', {
            accept(value) { return value === null }
          })

          let room = this.hooker._currentRoom

          this.hooker._currentRoom = null

          this.hooker._events.emit('leaved', { room })

          this.hooker._state = new StateWaitingForRoom(this.hooker)
        } catch (e) {
          log.bad('RoomHooker', e)
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
        exitRoom: async () => {
          if (this._currentRoom === null) {
            // There is nothing to do.
            return
          }

          let vueApp = vueAppApi.getVueApp()
          await vueApp.$store.dispatch('game/exitGame')

          // We could also call the leave method but unlike game/exitGame it
          // just sends a message to the server and does not wait for the
          // room to actually stop existing.
          //this._currentRoom.leave()
        },
        createRoom: async (options) => {
          let vueApp = vueAppApi.getVueApp()

          options.applyToKirkaGame(vueAppApi.getGameObject())

          if (this._game.room) {
            // Must leave current room otherwise game/enterGame will do nothing.
            await vueApp.$store.dispatch('game/exitGame')
          }

          await vueApp.$store.dispatch('game/enterGame')
          if (this._game.room) {
            return {
              roomId: this._game.room.id,
              regionId: this._game.selectedRegion
            }
          } else {
            // Unfortunately the error message is sent to a notification
            // module. We don't have access to the error object. The
            // most we could do is hook into the notification module
            // and retrieve the error message.
            throw new Error('Failed to join room.')
          }
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
  }
}
