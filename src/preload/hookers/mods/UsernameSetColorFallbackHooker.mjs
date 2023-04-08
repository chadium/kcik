import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as userApi from '../../user-api.mjs'

export class UsernameSetColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = (e) => {
      let messageElement = e.findMessageElement()

      let message = messageElement.textContent

      if (message.startsWith('!color')) {
        log.info('UsernameSetColorFallback', 'Got the color command.')

        let stateApi = this.pimp.getApi('state')

        let color = message.split(' ')[1]

        userApi.setColor({
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
