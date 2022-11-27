import * as adminApi from '../admin-api.mjs'

export class CustomTeamDeathMatchHooker {
  constructor() {
  }

  hook(pimp) {
    setInterval(() => {
      adminApi.addKill('asds', 1)
    }, 5000)
  }

  unhook(pimp) {
  }
}
