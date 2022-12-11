import EventEmitter from 'events'
import { Hooker } from '../../Pimp.mjs'
import * as adminApi from '../../admin-api.mjs'
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
  getState() {
    return 'unknown'
  }

  async matchJoin() {
    log.info('CustomTagMatchAdmin', `Joined tag game.`)
    await adminApi.tagReset()
    this.machine.next(new StateMatchWait())
  }

  async matchLeave() {
    log.info('CustomTagMatchAdmin', `Left tag game.`)
    await adminApi.tagReset()
  }
}

class StateMatchWait extends State {
  constructor() {
    super()
    this._timeout = null
  }

  async [MachineState.ON_ENTER]() {
    for (let playerName of this.machine.hooker.pimp.getApi('match').getPlayerNames()) {
      log.info('CustomTagMatchAdmin', `Adding ${playerName} to tag match.`)
      await adminApi.tagPlayerAdd(playerName)
    }

    const remaining = (this.machine.hooker._match.timestamp + 30000) - Date.now()

    log.info('CustomTagMatchAdmin', `Waiting for game to start...`)
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

  async playerJoin(playerName) {
    log.info('CustomTagMatchAdmin', `${playerName} joined tag`)
    await adminApi.tagPlayerAdd(playerName)
  }

  async playerLeave(playerName) {
    log.info('CustomTagMatchAdmin', `${playerName} left tag`)
    await adminApi.tagPlayerRemove(playerName)
  }
}

class StateMatchActive extends State {
  async [MachineState.ON_ENTER]() {
    log.info('CustomTagMatchAdmin', `Game started`)
    await this.machine.hooker._makeSomebodyIt()
  }

  getState() {
    return 'playing'
  }

  async playerJoin(playerName) {
    log.info('CustomTagMatchAdmin', `${playerName} joined tag mid match`)
    await adminApi.tagPlayerAdd(playerName)

    let it = await userApi.tagGetIt()

    if (it === null) {
      log.info('CustomTagMatchAdmin', `Nobody is it so will make ${playerName} it.`)
      await this.machine.hooker._makeSomebodyIt()
    }
  }

  async playerLeave(playerName) {
    log.info('CustomTagMatchAdmin', `${playerName} left tag mid match`)
    let it = await userApi.tagGetIt()

    await adminApi.tagPlayerRemove(playerName)

    if (it !== null) {
      if (it.name === playerName) {
        log.info('CustomTagMatchAdmin', `${playerName} left. Making somebody else it.`)
        await this.machine.hooker._makeSomebodyIt()
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
      log.info('CustomTagMatchAdmin', `${killerPlayerName} is now it.`)
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
      log.info('CustomTagMatchAdmin', `${deadPlayerName} killed themselves. Making somebody else it.`)
      await adminApi.tagRemoveIt()
      await this.machine.hooker._makeSomebodyIt(deadPlayerName)
    }
  }
}

export class CustomTagMatchAdminHooker extends Hooker {
  constructor(match) {
    super()
    this._state = new Machine({ base: State })
    this._state.hooker = this
    this._match = match
    this._onMatchJoin = async () => {
      await this._state.call('matchJoin')
    }
    this._onMatchLeave = async () => {
      await this._state.call('matchLeave')
    }
    this._onPlayerJoin = async ({ playerName }) => {
      await this._state.call('playerJoin', playerName)
    }
    this._onPlayerLeave = async ({ playerName }) => {
      await this._state.call('playerLeave', playerName)
    }
    this._onKill = async ({ killerPlayerName, deadPlayerName }) => {
      await this._state.call('kill', killerPlayerName, deadPlayerName)
    }
    this._onSuicide = async ({ deadPlayerName }) => {
      await this._state.call('suicide', deadPlayerName)
    }
  }

  async hook() {
    this._state.start(new StateUnknown())

    const matchApi = this.pimp.getApi('match')

    matchApi.on('matchAvailable', this._onMatchJoin)
    matchApi.on('matchLeave', this._onMatchLeave)
    matchApi.on('playerJoin', this._onPlayerJoin)
    matchApi.on('playerLeave', this._onPlayerLeave)
    matchApi.on('kill', this._onKill)
    matchApi.on('suicide', this._onSuicide)
  }

  async unhook() {
    await this._state.stop()

    const matchApi = this.pimp.getApi('match')

    matchApi.off('matchAvailable', this._onMatchJoin)
    matchApi.off('matchLeave', this._onMatchLeave)
    matchApi.off('playerJoin', this._onPlayerJoin)
    matchApi.off('playerLeave', this._onPlayerLeave)
    matchApi.off('kill', this._onKill)
    matchApi.off('suicide', this._onSuicide)
  }

  async _makeSomebodyIt(exception) {
    const matchApi = this.pimp.getApi('match')

    let playerNames = matchApi.getPlayerNames()

    if (exception !== undefined) {
      arrayUtils.removeFirstByValue(playerNames, exception)
    }

    if (playerNames.length === 0) {
      // Can't do anything.
      return
    }

    let otherPlayerName = randUtils.pickOne(playerNames)

    await adminApi.tagSetIt(otherPlayerName)
  }
}
