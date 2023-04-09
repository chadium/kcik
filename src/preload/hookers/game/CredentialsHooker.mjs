import { Hooker } from '../../Pimp.mjs'
import Cookies from 'js-cookie'

export class CredentialsHooker extends Hooker {
  constructor() {
    super()
  }

  async hook() {
    return {
      name: 'credentials',
      api: {
        getAuthToken() {
          return Cookies.get('XSRF-TOKEN')
        }
      }
    }
  }

  async unhook() {
  }
}
