import * as adminApi from '../admin-api.mjs'

export class CustomTeamDeathMatchHooker {
  constructor() {
    this._playerEntity = null
  }

  hook(pimp) {
    let playerApi = pimp.getApi('player')

    let matchApi = pimp.getApi('match')

    matchApi.on('playerJoin', (e) => {
      console.log('playerJoin', e)
    })

    matchApi.on('playerLeave', (e) => {
      console.log('playerLeave', e)
    })

    matchApi.on('playerDeath', (e) => {
      adminApi.addDeath(e.player.name, 1)
      adminApi.addScore(e.player.name, -20)
    })
    matchApi.on('playerKill', (e) => {
      adminApi.addKill(e.player.name, 1)
      adminApi.addScore(e.player.name, 50)
    })
  }

  unhook(pimp) {
  }
}
