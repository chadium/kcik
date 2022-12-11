import EventEmitter from 'events'
import { Hooker } from '../../Pimp.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'
import * as randUtils from '../../rand-utils.mjs'
import * as arrayUtils from '../../array-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

class State extends MachineState {
  async matchJoin() {
  }
  async matchLeave() {
  }
}

class StateUnknown extends State {
  getState() {
    return 'unknown'
  }

  async matchJoin() {
    log.info('CustomTagMatch', `Joined tag game.`)
    this.machine.next(new StateMatchWait())
  }

  async matchLeave() {
    log.info('CustomTagMatch', `Left tag game.`)
  }
}

class StateMatchWait extends State {
  constructor() {
    super()
    this._timeout = null
  }

  async [MachineState.ON_ENTER]() {
    this.machine.hooker._emitStateChange()

    const remaining = (this.machine.hooker._match.timestamp + 30000) - Date.now()

    log.info('CustomTagMatch', `Waiting for game to start...`)
    this._timeout = setTimeout(() => {
      this.machine.next(new StateMatchActive())
    }, remaining)
  }

  async [MachineState.ON_LEAVE]() {
    clearTimeout(this._timeout)
  }

  getState() {
    return 'waiting'
  }
}

class StateMatchActive extends State {
  async [MachineState.ON_ENTER]() {
    this.machine.hooker._emitStateChange()

    log.info('CustomTagMatch', `Game started`)
  }

  getState() {
    return 'playing'
  }
}

export class CustomTagMatchHooker extends Hooker {
  constructor(match) {
    super()
    this._events = new EventEmitter()
    this._state = new Machine({ base: State })
    this._state.hooker = this
    this._match = match
    this._onMatchJoin = async () => {
      await this._state.call('matchJoin')
    }
    this._onMatchLeave = async () => {
      await this._state.call('matchLeave')
    }
  }

  async hook() {
    this._state.start(new StateUnknown())

    const matchApi = this.pimp.getApi('match')

    matchApi.on('matchAvailable', this._onMatchJoin)
    matchApi.on('matchLeave', this._onMatchLeave)

    return {
      name: 'customTagMatch',
      api: {
        getCreatedTimestamp: () => this._match.timestamp,
        getState: () => this._state.call('getState'),
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  async unhook() {
    await this._state.stop()

    const matchApi = this.pimp.getApi('match')

    matchApi.off('matchAvailable', this._onMatchJoin)
    matchApi.off('matchLeave', this._onMatchLeave)
  }

  async _emitStateChange() {
    this._events.emit('stateChange', { state: await this._state.call('getState') })
  }
}
