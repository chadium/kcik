import { Hooker } from '../../Pimp.mjs'
import * as adminApi from '../../admin-api.mjs'
import * as log from '../../log.mjs'

export class CustomTeamDeathMatchHooker extends Hooker {
  constructor() {
    this._playerEntity = null
  }

  hook() {
    let playerApi = this.pimp.getApi('player')

    let matchApi = this.pimp.getApi('match')

    matchApi.on('playerJoin', (e) => {
      log.info('CustomTeamDeathMatch', 'playerJoin', e)
    })

    matchApi.on('playerLeave', (e) => {
      log.info('CustomTeamDeathMatch', 'playerLeave', e)
    })

    matchApi.on('kill', (e) => {
      adminApi.teamDeathmatchAddDeath(e.deadPlayerName, 1)
      adminApi.teamDeathmatchAddKill(e.killerPlayerName, 1)
      adminApi.teamDeathmatchAddScore(e.killerPlayerName, e.headshot ? 60 : 50)
    })
    matchApi.on('suicide', (e) => {
      adminApi.teamDeathmatchAddScore(e.deadPlayerName, -30)
    })
  }

  unhook() {
  }
}
