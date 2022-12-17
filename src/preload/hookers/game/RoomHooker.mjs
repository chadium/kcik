import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { waitForProperty } from '../../object-utils.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

class State extends MachineState {
  onAvailableListener(listener) {
  }
}

class StateUnknown extends State {
  async [MachineState.ON_ENTER]() {
    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let gameState = vueAppApi.getModuleState('game')
      
      if (gameState.room) {
        log.info('RoomHooker', 'Already in a room.')
        this.machine.hooker._currentRoom = gameState.room
        this.machine.next(new StateInRoom())
      } else {
        this.machine.next(new StateWaitingForRoom())
      }
    })
  }
}

class StateWaitingForRoom extends State {
  constructor() {
    super()
    this._onMutation = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('RoomHooker', 'Will be waiting for room')

    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    this._onMutation = vueAppApi.onMutation('game/setRoom', (room) => {
      if (room !== null) {
        this.machine.hooker._currentRoom = room
        this.machine.next(new StateInRoom())
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this._onMutation.close()
    this._onMutation = null
  }
}

class StateInRoom extends State {
  constructor() {
    super()
    this._onMutation = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('RoomHooker', 'Found room')

    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    this.machine.hooker._events.emit('join', { room: this.machine.hooker._currentRoom })
    this.machine.hooker._events.emit('available', { room: this.machine.hooker._currentRoom })

    this.machine.hooker._currentRoom.onStateChange((e) => {
      this.machine.hooker._events.emit('stateChange', e)
    })

    this._onMutation = vueAppApi.onMutation('game/setRoom', (room) => {
      if (room === null) {
        let room = this.machine.hooker._currentRoom

        this.machine.hooker._currentRoom = null

        this.machine.hooker._events.emit('leave', { room })

        this.machine.hooker._state.next(new StateWaitingForRoom())
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this._onMutation.close()
    this._onMutation = null
  }

  onAvailableListener(listener) {
    listener()
  }
}

export class RoomHooker extends Hooker {
  constructor() {
    super()
    this._currentRoom = null
    this._state = new Machine({ base: State })
    this._state.hooker = this
    this._events = new EventEmitter()
  }

  async hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    await this._state.start(new StateUnknown())

    this._events.on('newListener', async (name, listener) => {
      if (name === 'available') {
        let state = await this._state.state()
        state.onAvailableListener(listener)
      }
    })

    return {
      name: 'room',
      api: {
        getRoom: () => {
          return this._currentRoom
        },
        getRoomIdentification: () => {
          let gameState = vueAppApi.getModuleState('game')
          return {
            roomId: gameState.room.id,
            regionId: gameState.selectedRegion
          }
        },
        exitRoom: async () => {
          if (this._currentRoom === null) {
            // There is nothing to do.
            return
          }

          await vueAppApi.storeDispatch('game/exitGame')

          // We could also call the leave method but unlike game/exitGame it
          // just sends a message to the server and does not wait for the
          // room to actually stop existing.
          //this._currentRoom.leave()
        },
        joinRoom: async (regionId, roomId) => {
          if (this._currentRoom !== null) {
            throw new Error('Cannot join room while already in a room')
          }

          let gameState = vueAppApi.getModuleState('game')

          let id = `${regionId}~${roomId}`

          await vueAppApi.storeDispatch('game/connectByIdRoom', id)
          if (gameState.room) {
            return {
              roomId: gameState.room.id,
              regionId: gameState.selectedRegion
            }
          } else {
            // Unfortunately the error message is sent to a notification
            // module. We don't have access to the error object. The
            // most we could do is hook into the notification module
            // and retrieve the error message.
            throw new Error('Failed to join room.')
          }
        },
        createRoom: async (options) => {
          let gameState = vueAppApi.getModuleState('game')

          options.applyToKirkaGame(gameState)

          if (gameState.room) {
            // Must leave current room otherwise game/enterGame will do nothing.
            await vueAppApi.storeDispatch('game/exitGame')
          }

          await vueAppApi.storeDispatch('game/enterGame')
          if (gameState.room) {
            return {
              roomId: gameState.room.id,
              regionId: gameState.selectedRegion
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

  async unhook() {
    await this._state.stop()
  }
}
