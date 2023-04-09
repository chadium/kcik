import { Hooker } from '../../Pimp.mjs'
import * as kickApi from '../../kick-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'
import { ChatroomAuthentication } from '../../ChatroomAuthentication.mjs'

export class StateHooker extends Hooker {
  constructor() {
    super()

    this.authenticationToken = null
    this.colorsByUser = {}
    this.masterport = null
    this.authenticationChatroomId = null
    this.chatroomAuthentication = new ChatroomAuthentication({
      masterportSend: (message) => {
        this.masterport.send(message)
      },

      chatroomSend: async (chatroomId, message) => {
        let credentialsApi = this.pimp.getApi('credentials')

        await kickApi.sendChatMessage({
          chatroomId,
          message,
          authToken: credentialsApi.getAuthToken()
        })
      }
    })
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
        setUsernameColor: async (username, color) => {
          let { token } = await this.chatroomAuthentication.start(username)

          await userApi.setColor({
            token,
            color
          })
        },
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
