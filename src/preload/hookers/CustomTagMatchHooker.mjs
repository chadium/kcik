import * as adminApi from '../admin-api.mjs'
import * as userApi from '../user-api.mjs'
import * as log from '../log.mjs'

export class CustomTagMatchHooker {
  constructor() {
    this._playerEntity = null
  }

  hook(pimp) {
    let playerApi = pimp.getApi('player')

    let matchApi = pimp.getApi('match')

    matchApi.on('kill', async ({ killerPlayerName, deadPlayerName }) => {
      let it = await userApi.tagGetIt()

      if (it === null) {
        // Can't really do much.
        return
      }

      if (it.name === deadPlayerName) {
        log.info('CustomTagMatch', `${killerPlayerName} is now it.`)
        await adminApi.tagSetIt(killerPlayerName)
      }
    })
    matchApi.on('suicide', async ({ deadPlayerName }) => {
      let it = await userApi.tagGetIt()

      if (it === null) {
        // Can't really do much.
        return
      }

      // TODO: remove tag and tag someone else at random
    })
    matchApi.on('playerLeave', async ({ deadPlayerName }) => {
      let it = await userApi.tagGetIt()

      if (it === null) {
        // Can't really do much.
        return
      }

      // TODO: remove tag and tag someone else at random
    })
  }

  unhook(pimp) {
  }
}
