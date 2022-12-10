import EventEmitter from 'events'
import * as adminApi from '../../admin-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'
import * as randUtils from '../../rand-utils.mjs'
import * as arrayUtils from '../../array-utils.mjs'

class State {
  async matchJoin() {
  }
  async matchLeave() {
  }
  async playerJoin(playerName) {
  }
  async playerLeave(playerName) {
  }
  async kill(killerPlayerName, deadPlayerName) {
  }
  async suicide(deadPlayerName) {
  }
}

class StateUnknown extends State {
  constructor(hooker) {
    super()
    this._hooker = hooker
  }

  getState() {
    return 'unknown'
  }

  async matchJoin() {
    log.info('CustomTagMatch', `Joined tag game.`)
    await adminApi.tagReset()
    this._hooker._state = new StateMatchWait(this._hooker)
    this._hooker._emitStateChange()
  }

  async matchLeave() {
    log.info('CustomTagMatch', `Left tag game.`)
    await adminApi.tagReset()
  }
}

class StateMatchWait extends State {
  constructor(hooker) {
    super()
    this._hooker = hooker

    log.info('CustomTagMatch', `Waiting for game to start...`)
    this._timeout = setTimeout(() => {
      this._hooker._state = new StateMatchActive(this._hooker)
      this._hooker._emitStateChange()
    }, 30000)
  }

  getState() {
    return 'waiting'
  }

  async playerJoin(playerName) {
    log.info('CustomTagMatch', `${playerName} joined tag`)
    await adminApi.tagPlayerAdd(playerName)
  }

  async playerLeave(playerName) {
    log.info('CustomTagMatch', `${playerName} left tag`)
    await adminApi.tagPlayerRemove(playerName)
  }
}

class StateMatchActive extends State {
  constructor(hooker) {
    super()
    this._hooker = hooker

    {
      (async () => {
        log.info('CustomTagMatch', `Game started`)
        await this._hooker._makeSomebodyIt()
      })()
    }
  }

  getState() {
    return 'playing'
  }

  async playerJoin(playerName) {
    log.info('CustomTagMatch', `${playerName} joined tag mid match`)
    await adminApi.tagPlayerAdd(playerName)
  }

  async playerLeave(playerName) {
    log.info('CustomTagMatch', `${playerName} left tag mid match`)
    let it = await userApi.tagGetIt()

    await adminApi.tagPlayerRemove(playerName)

    if (it !== null) {
      if (it.name === playerName) {
        log.info('CustomTagMatch', `${playerName} left. Making somebody else it.`)
        await this._hooker._makeSomebodyIt()
      }
    }
  }

  async kill(killerPlayerName, deadPlayerName) {
    let it = await userApi.tagGetIt()

    if (it === null) {
      // Can't really do much.
      return
    }

    if (it.name === deadPlayerName) {
      log.info('CustomTagMatch', `${killerPlayerName} is now it.`)
      await adminApi.tagSetIt(killerPlayerName)
    }
  }

  async suicide(deadPlayerName) {
    let it = await userApi.tagGetIt()

    if (it === null) {
      // Nothing to do.
      return
    }

    if (it.name === deadPlayerName) {
      log.info('CustomTagMatch', `${deadPlayerName} killed themselves. Making somebody else it.`)
      await adminApi.tagRemoveIt()
      await this._hooker._makeSomebodyIt(deadPlayerName)
    }
  }
}

export class CustomTagMatchHooker {
  constructor() {
    this._events = new EventEmitter()
    this._state = null
    this._matchApi = null
    this._onMatchJoin = async () => {
      await this._state.matchJoin()
    }
    this._onMatchLeave = async () => {
      await this._state.matchLeave()
    }
    this._onPlayerJoin = async ({ playerName }) => {
      await this._state.playerJoin(playerName)
    }
    this._onPlayerLeave = async ({ playerName }) => {
      await this._state.playerLeave(playerName)
    }
    this._onKill = async ({ killerPlayerName, deadPlayerName }) => {
      await this._state.kill(killerPlayerName, deadPlayerName)
    }
    this._onSuicide = async ({ deadPlayerName }) => {
      await this._state.suicide(deadPlayerName)
    }
  }

  async hook(pimp) {
    this._state = new StateUnknown(this)
    this._emitStateChange()

    this._matchApi = pimp.getApi('match')

    this._matchApi.on('matchAvailable', this._onMatchJoin)
    this._matchApi.on('matchLeave', this._onMatchLeave)
    this._matchApi.on('playerJoin', this._onPlayerJoin)
    this._matchApi.on('playerLeave', this._onPlayerLeave)
    this._matchApi.on('kill', this._onKill)
    this._matchApi.on('suicide', this._onSuicide)

    return {
      name: 'customTagMatch',
      api: {
        getState: () => this._state.getState(),
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  async unhook(pimp) {
    this._matchApi.off('matchAvailable', this._onMatchJoin)
    this._matchApi.off('matchLeave', this._onMatchLeave)
    this._matchApi.off('playerJoin', this._onPlayerJoin)
    this._matchApi.off('playerLeave', this._onPlayerLeave)
    this._matchApi.off('kill', this._onKill)
    this._matchApi.off('suicide', this._onSuicide)
  }

  async _makeSomebodyIt(exception) {
    let playerNames = this._matchApi.getPlayerNames()

    if (playerNames.length <= 1) {
      // Can't do anything.
      return
    }

    if (exception !== undefined) {
      arrayUtils.removeFirstByValue(playerNames, exception)
    }

    let otherPlayerName = randUtils.pickOne(playerNames)

    await adminApi.tagSetIt(otherPlayerName)
  }

  _emitStateChange() {
    this._events.emit('stateChange', { state: this._state.getState() })
  }
}
