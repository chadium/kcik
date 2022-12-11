import deepEqual from 'deep-equal'
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
    this._rankingSocket = null
    this._itSocket = null
    this._players = []
    this._it = null
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

    this._rankingSocket = userApi.wsTagRanking({
      onConnect: async () => {
        if (this._setPlayers(await userApi.getTagRanking())) {
          this._events.emit('playersChange', this._players)
        }
      },
      onUpdate: ({ ranking }) => {
        if (this._setPlayers(ranking)) {
          this._events.emit('playersChange', this._players)
        }
      }
    })

    this._itSocket = userApi.wsTagIt({
      onConnect: async () => {
        if (this._setIt(await userApi.tagGetIt())) {
          this._events.emit('itChange', this._it)
        }
      },
      onUpdate: ({ it }) => {
        if (this._setIt(it)) {
          this._events.emit('itChange', this._it)
        }
      }
    })

    return {
      name: 'customTagMatch',
      api: {
        getCreatedTimestamp: () => this._match.timestamp,
        getState: () => this._state.call('getState'),
        getPlayers: () => this._players,
        getIt: () => this._it,
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  async unhook() {
    await this._state.stop()

    this._rankingSocket.close()
    this._rankingSocket = null

    this._itSocket.close()
    this._itSocket = null

    const matchApi = this.pimp.getApi('match')

    matchApi.off('matchAvailable', this._onMatchJoin)
    matchApi.off('matchLeave', this._onMatchLeave)
  }

  async _emitStateChange() {
    this._events.emit('stateChange', { state: await this._state.call('getState') })
  }

  _setIt(it) {
    if (!deepEqual(this._it, it)) {
      this._it = it
      return true
    } else {
      return false
    }
  }

  _setPlayers(players) {
    if (!deepEqual(this._players, players)) {
      this._players = players
      return true
    } else {
      return false
    }
  }
}
