import { Hooker } from '../../Pimp.mjs'

export class PlayerHooker extends Hooker {
  constructor() {
    super()
    this._userObject = null
    this._gameObject = null
  }

  hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      this._userObject = vueAppApi.getUserObject()
      this._gameObject = vueAppApi.getGameObject()
    })

    return {
      name: 'player',
      api: {
        getName: () => {
          return this._getPlayer().name
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
