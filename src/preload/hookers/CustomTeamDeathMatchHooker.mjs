import * as adminApi from '../admin-api.mjs'
import * as log from '../log.mjs'

export class CustomTeamDeathMatchHooker {
  constructor() {
    this._playerEntity = null
  }

  hook(pimp) {
    let playerApi = pimp.getApi('player')

    let matchApi = pimp.getApi('match')

    matchApi.on('playerJoin', (e) => {
      log.info('CustomTeamDeathMatch', 'playerJoin', e)
    })

    matchApi.on('playerLeave', (e) => {
      log.info('CustomTeamDeathMatch', 'playerLeave', e)
    })

    matchApi.on('playerDeath', (e) => {
      adminApi.matchAddDeath(e.player.name, 1)
      adminApi.matchAddScore(e.player.name, -20)
    })
    matchApi.on('playerKill', (e) => {
      adminApi.matchAddKill(e.player.name, 1)
      adminApi.matchAddScore(e.player.name, 50)
    })
  }

  unhook(pimp) {
  }
}
