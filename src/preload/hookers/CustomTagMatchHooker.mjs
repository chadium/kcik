import * as adminApi from '../admin-api.mjs'
import * as userApi from '../user-api.mjs'
import * as log from '../log.mjs'

export class CustomTagMatchHooker {
  constructor() {
    this._playerEntity = null

    // Will need this to keep track of who killed who.
    this._playerLastKiller = null
  }

  hook(pimp) {
    let playerApi = pimp.getApi('player')

    let matchApi = pimp.getApi('match')

    matchApi.on('playerDeath', async (e) => {
      let lastKiller = this._playerLastKiller

      if (lastKiller === null) {
        // Can't do much with this info.
        log.warn('CustomTagMatch', 'No idea who the last killer was.')
        return
      }

      let it = await userApi.tagGetIt()

      if (it === null) {
        // Can't really do much.
        return
      }

      if (it.name === e.player.name) {
        log.warn('CustomTagMatch', `${lastKiller} is now it.`)
        await adminApi.tagSetIt(lastKiller)
      }
    })
    matchApi.on('playerKill', (e) => {
      this._playerLastKiller = e.player.name
    })
  }

  unhook(pimp) {
  }
}
