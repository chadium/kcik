import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import { ElapsedServerTime } from '../../elapsed-server-time.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

class State extends MachineState {
  onMatchAvailableListener(listener) {
  }
}

class StateUnknown extends State {
  async [MachineState.ON_ENTER]() {
    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let gameState = vueAppApi.getModuleState('game')

      if (!gameState.searchingRoom && gameState.room !== null) {
        // Already in a match.
        this.machine.next(new StateWaitingForFirstState())
      } else {
        // Oh boy. setSearchingRoom might be called any time.
        this.machine.next(new StateIdle())
      }
    })
  }
}

class StateIdle extends State {
  constructor() {
    super()
    this._onMutation = null
  }

  async [MachineState.ON_ENTER]() {
    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    this._onMutation = vueAppApi.onMutation('game/setSearchingRoom', (searchingRoom) => {
      if (searchingRoom === false) {
        let gameState = vueAppApi.getModuleState('game')

        if (gameState.room) {
          // Got into a match.
          this.machine.next(new StateWaitingForFirstState())
        }
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this._onMutation.close()
    this._onMutation = null
  }
}

class StateWaitingForFirstState extends State {
  constructor() {
    super()
    this._onStateChange = (e) => {
      this.machine.hooker._elapsedTime.setServerTime(e.serverTime)
      this.machine.next(new StatePlaying())
    }
    this._onLeave = ({ room }) => {
      // Oh no.
      this.machine.next(new StateIdle())
    }
  }

  async [MachineState.ON_ENTER]() {
    let roomApi = this.machine.hooker.pimp.getApi('room')
    roomApi.on('stateChange', this._onStateChange)
    roomApi.on('leaved', this._onLeave)
  }

  async [MachineState.ON_LEAVE]() {
    let roomApi = this.machine.hooker.pimp.getApi('room')
    roomApi.off('stateChange', this._onStateChange)
    roomApi.off('leaved', this._onLeave)
  }
}

class StatePlaying extends State {
  constructor() {
    super()
    this._onKill = ({ deadPlayerName, killerPlayerName, headshot }) => {
      this.machine.hooker._events.emit('kill', {
        deadPlayerName,
        killerPlayerName,
        headshot
      })
    }
    this._onSuicide = ({ deadPlayerName }) => {
      this.machine.hooker._events.emit('suicide', {
        deadPlayerName
      })
    }
    this._onLeave = ({ room }) => {
      this.machine.next(new StateIdle())
    }
    this._onStateChange = (e) => {
      this.machine.hooker._elapsedTime.setServerTime(e.serverTime)

      let found = Object.assign({}, this.machine.hooker._found)

      for (let player of e.players.values()) {
        if (player.sessionId in found) {
          delete found[player.sessionId]
          continue 
        }

        // New player.
        this.machine.hooker._found[player.sessionId] = player

        try {
          this.machine.hooker._events.emit('playerJoin', {
            playerName: player.name
          })
        } catch (e) {
          log.bad('MatchHooker', e)
        }

        player.listen('deaths', (current, previous) => {
          log.info('Match', `${player.name} got killed`)
          this.machine.hooker._events.emit('playerDeath', {
            playerName: player.name,
            current,
            previous
          })
        })
        player.listen('kills', (current, previous) => {
          log.info('Match', `${player.name} killed`)
          this.machine.hooker._events.emit('playerKill', {
            playerName: player.name,
            current,
            previous
          })
        })
        player.listen('score', (current, previous) => {
          log.info('Match', `${player.name} new score`, current)
          this.machine.hooker._events.emit('playerScore', {
            playerName: player.name,
            current,
            previous
          })
        })
      }

      for (let sessionId in found) {
        // Player left.

        let player = this.machine.hooker._found[sessionId]

        try {
          this.machine.hooker._events.emit('playerLeave', {
            playerSessionId: player.sessionId,
            playerName: player.name
          })
        } catch (e) {
          log.bad('MatchHooker', e)
        }

        delete this.machine.hooker._found[sessionId]
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('MatchHooker', 'Entering match')

    this.machine.hooker._events.emit('matchJoin')
    this.machine.hooker._events.emit('matchAvailable')

    let killbarApi = this.machine.hooker.pimp.getApi('killbar')

    killbarApi.on('kill', this._onKill)
    killbarApi.on('suicide', this._onSuicide)

    let roomApi = this.machine.hooker.pimp.getApi('room')

    roomApi.on('leaved', this._onLeave)
    roomApi.on('stateChange', this._onStateChange)
  }

  async [MachineState.ON_LEAVE]() {
    log.info('MatchHooker', 'Leaving match')

    for (let sessionId in this.machine.hooker._found) {
      let player = this.machine.hooker._found[sessionId]

      try {
        this.machine.hooker._events.emit('playerLeave', {
          playerName: player.name
        })
      } catch (e) {
        log.bad('MatchHooker', e)
      }

      delete this.machine.hooker._found[sessionId]
    }

    let killbarApi = this.machine.hooker.pimp.getApi('killbar')

    killbarApi.off('kill', this._onKill)
    killbarApi.off('suicide', this._onSuicide)

    let roomApi = this.machine.hooker.pimp.getApi('room')

    roomApi.off('leaved', this._onLeave)
    roomApi.off('stateChange', this._onStateChange)

    this.machine.hooker._events.emit('matchLeave')
  }

  onMatchAvailableListener(listener) {
    listener()
  }
}

export class MatchHooker extends Hooker {
  constructor() {
    super()
    this._found = {}
    this._events = new EventEmitter()
    this._elapsedTime = new ElapsedServerTime()
    this._state = new Machine({ base: State })
    this._state.hooker = this
  }

  async hook() {
    let vueAppApi = this.pimp.getApi('vueApp')
    let playerApi = this.pimp.getApi('player')

    await this._state.start(new StateUnknown())

    this._events.on('newListener', async (name, listener) => {
      if (name === 'matchAvailable') {
        let state = await this._state.state()
        state.onMatchAvailableListener(listener)
      }
    })

    return {
      name: 'match',
      api: {
        getPlayerNames: () => {
          return Object.values(this._found).map(p => p.name)
        },
        getSessionIdByName: (name) => {
          for (let player of Object.values(this._found)) {
            if (player.name === name) {
              return player.sessionId
            }
          }

          return null
        },
        getOtherPlayerIdentifications: () => {
          let mySessionId = playerApi.getSessionId()

          return Object.values(this._found)
            .filter(p => p.sessionId !== mySessionId)
            .map(p => ({
              name: p.name,
              sessionId: p.sessionId,
            }))
        },
        showRankingScreen: (state) => {
          vueAppApi.storeCommit('app/WNnMwm', state)
        },
        getDuration: () => {
          return vueAppApi.getModuleState('game').metadata.minutes * 60 * 1000
        },
        getElapsedTime: () => {
          return this._elapsedTime.getTweened()
        },
        getServerTime: () => {
          return new ElapsedServerTime(this._elapsedTime)
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  async unhook() {
    await this._state.stop()
    this._events.removeAllListeners()
  }
}
