export class PlayerHooker {
  constructor() {
    this._userObject = null
    this._gameObject = null
  }

  hook(pimp) {
    let vueAppApi = pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      this._userObject = vueAppApi.getUserObject()
      this._gameObject = vueAppApi.getGameObject()
    })

    return {
      name: 'player',
      api: {
        getName: () => {
          if (this._userObject === null) {
            throw new Error('No player info.')
          }

          // TODO
          return 'Unknown'
        },
        getKills: () => {
          if (this._userObject === null) {
            throw new Error('No player info.')
          }

          if (this._userObject.stats.kills === '~') {
            return 0
          }

          return this._userObject.stats.kills
        },
      }
    }
  }

  unhook(pimp) {
  }
}
