export class PlayerHooker {
  constructor() {
    this._playerEntity = null
  }

  hook(pimp) {
    pimp.getApi('mystery').on('available', (mysteryObject) => {
      // Seems to be the player entity.
      this._playerEntity = mysteryObject.WMmNw
    })

    return {
      name: 'player',
      api: {
        getName: () => {
          if (this._playerEntity === null) {
            throw new Error('No player info.')
          }

          return this._playerEntity._components[50].name
        },
        kills: () => {
          if (this._playerEntity === null) {
            throw new Error('No player info.')
          }

          return this._playerEntity._components[50].kills
        },
      }
    }
  }

  unhook(pimp) {
  }
}
