import { Hooker } from '../../Pimp.mjs'
import * as kickApi from '../../kick-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'
import { ChatroomAuthentication } from '../../ChatroomAuthentication.mjs'
import { toaster } from '../../toaster.mjs'

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
          message: btoa(message),
          authToken: credentialsApi.getAuthToken()
        })
      }
    })
  }

  async hook() {
    this.masterport = userApi.masterport({
      onMessage: (message) => {
        switch (message.type) {
          case 'newUserColor':
            log.info('State', `${message.username} changed color to ${message.color}`)
            this.colorsByUser[message.username] = message.color
            break

          case 'removeUserColor':
            log.info('State', `${message.username} removed color`)
            delete this.colorsByUser[message.username]
            break

          default:
            this.chatroomAuthentication.masterportReceive(message)
            break
        }
      }
    })

    userApi.listColors().then((list) => {
      for (const info of list) {
        this.colorsByUser[info.username] = info.color
      }

      log.info('State', 'Got list of colors. Contains: ' + Object.keys(this.colorsByUser).length)
    })

    return {
      name: 'state',
      api: {
        setUsernameColor: async (color) => {
          let patientNotification = (() => {
            if (color !== null) {
              toaster('Assigning you a color, please wait...', {
                duration: Infinity
              })
            } else {
              toaster('Removing your color, please wait...', {
                duration: Infinity
              })
            }
          })()

          try {
            await this.chatroomAuthentication.use(async ({ token }) => {
              await userApi.setColor({
                token,
                color
              })
            })
            if (color !== null) {
              toaster('New username color has been set.')
            } else {
              toaster('Username color has been removed.')
            }
          } catch (e) {
            toaster('Failed to set color. Try again later.')
            throw e
          } finally {
            patientNotification.remove()
          }
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
