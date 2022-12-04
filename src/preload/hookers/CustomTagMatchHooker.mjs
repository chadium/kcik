import * as adminApi from '../admin-api.mjs'
import * as userApi from '../user-api.mjs'
import * as log from '../log.mjs'
import * as randUtils from '../rand-utils.mjs'
import * as arrayUtils from '../array-utils.mjs'

export class CustomTagMatchHooker {
  constructor() {
    this._playerEntity = null
  }

  hook(pimp) {
    let matchApi = pimp.getApi('match')

    matchApi.on('matchJoin', async () => {
      await adminApi.tagReset()
    })

    matchApi.on('matchLeave', async () => {
    })

    matchApi.on('playerJoin', async ({ playerName }) => {
      log.info('CustomTagMatch', `${playerName} joined tag`)
      await adminApi.tagPlayerAdd(playerName)

      let it = await userApi.tagGetIt()

      let playerNames = matchApi.getPlayerNames()

      if (playerNames.length === 1 && it === null) {
        log.info('CustomTagMatch', `${playerName} joined first. Will become it.`)
        await adminApi.tagSetIt(killerPlayerName)
      }
    })

    matchApi.on('playerLeave', async ({ playerName }) => {
      log.info('CustomTagMatch', `${playerName} left tag`)
      let it = await userApi.tagGetIt()

      await adminApi.tagPlayerRemove(playerName)

      if (it !== null) {
        if (it.name === playerName) {
          log.info('CustomTagMatch', `${playerName} left. Making somebody else it.`)
          await this._makeSomebodyElseIt(matchApi)
        }
      }
    })

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
        // Nothing to do.
        return
      }

      if (it.name === deadPlayerName) {
        log.info('CustomTagMatch', `${deadPlayerName} killed themselves. Making somebody else it.`)
        await adminApi.tagRemoveIt()
        await this._makeSomebodyElseIt(matchApi, deadPlayerName)
      }
    })
  }

  unhook(pimp) {
  }

  async _makeSomebodyElseIt(matchApi, exception) {
    let playerNames = matchApi.getPlayerNames()

    if (playerNames.length <= 1) {
      // Can't do anything.
      return
    }

    arrayUtils.removeFirstByValue(playerNames, exception)

    let otherPlayerName = randUtils.pickOne(playerNames)

    await adminApi.tagSetIt(otherPlayerName)
  }
}
