import { Hooker } from '../../Pimp.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class StateHooker extends Hooker {
  constructor() {
    super()

    this.authenticationToken = null
    this.colorsByUser = {}
    this.masterport = null
    this.authenticationChatroomId = null
  }

  async hook() {
    this.masterport = userApi.masterport({
      onNewUserColor: ({ username, color }) => {
        this.colorsByUser[username] = color
      }
    })

    userApi.listColors().then((list) => {
      for (const info of list) {
        this.colorsByUser[info.username] = info.color
      }

      log.info('Got list of colors. Contains:', Object.keys(this.colorsByUser).length)
    })

    return {
      name: 'state',
      api: {
        getUsernameColor: (username) => {
          if (username in this.colorsByUser) {
            return this.colorsByUser[username]
          } else {
            return null
          }
        },
        getAuthenticationChatroomId: () => {
          return this.authenticationChatroomId
        }
      }
    }
  }

  async unhook() {
    this.masterport.close()
  }
}
