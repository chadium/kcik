import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as kickApi from '../../kick-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as colorUtils from '../../color-utils.mjs'

export class UsernameSetColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = async (e) => {
      let messageElement = e.findMessageElement()

      let message = messageElement.textContent

      if (message.startsWith('!color')) {
        log.info('UsernameSetColorFallback', 'Got the color command.')

        let stateApi = this.pimp.getApi('state')

        let color = colorUtils.toRgbHex(message.split(' ')[1])

        if (color === null) {
          // Show message to user.
        }

        let credentialsApi = this.pimp.getApi('credentials')

        await kickApi.sendChatMessage({
          chatroomId: stateApi.getAuthenticationChatroomId(),
          message: "this is a test.",
          authToken: credentialsApi.getAuthToken()
        })

        await userApi.setColor({
          username: e.findUsernameElement().textContent,
          color
        })
      }
    }
  }

  async hook() {
    let domChatMessageApi = this.pimp.getApi('domChatMessage')

    domChatMessageApi.on('chatMessage', this.onNewMessage)
  }

  async unhook() {
    let domChatMessageApi = this.pimp.getApi('domChatMessage')

    domChatMessageApi.off('chatMessage', this.onNewMessage)
  }
}
