import { Hooker } from '../../Pimp.mjs'

export class UserHooker extends Hooker {
  constructor() {
    super()
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    return {
      name: 'user',
      api: {
        getCurrentUsername() {
          let user = vueAppApi.getModuleState('user')
          return user.user?.username
        }
      }
    }
  }

  async unhook() {
  }
}
