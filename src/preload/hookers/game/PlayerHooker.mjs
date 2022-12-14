import EventEmitter from 'events'
import { onceMutation } from '../../vuex-utils.mjs'
import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class PlayerHooker extends Hooker {
  constructor() {
    super()
    this._userObject = null
    this._gameObject = null
    this._gotSet = false
    this._events = new EventEmitter()
  }

  hook() {
    this._events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._gotSet) {
          // Already available. Call it.
          listener()
        }
      }
    })

    let vueAppApi = this.pimp.getApi('vueApp')
    let roomApi = this.pimp.getApi('room')

    roomApi.on('available', () => {
      this._userObject = vueAppApi.getUserObject()
      this._gameObject = vueAppApi.getGameObject()

      this._setWorldMutationHooker = vueAppApi.onceMutation('game/setPlayers', (players) => {
        log.info('Player', 'Got players')
        this._gotSet = true
        this._events.emit('available')
      })
    })

    return {
      name: 'player',
      api: {
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
        getName: () => {
          return this._getPlayer().name
        },
        getSessionId: () => {
          return this._gameObject.mySessionId
        },
        getKills: () => {
          return this._getPlayer().hits
        },
        getDeaths: () => {
          return this._getPlayer().deaths
        },
        getScore: () => {
          return this._getPlayer().score
        },
      }
    }
  }

  unhook() {
  }

  _getPlayer() {
    if (this._gameObject === null) {
      throw new Error('No player info.')
    }

    if (this._gameObject.players === null) {
      throw new Error('No player info.')
    }

    let player = this._gameObject.players[this._gameObject.mySessionId]

    if (player === null) {
      throw new Error('No player info.')
    }

    return player
  }
}
