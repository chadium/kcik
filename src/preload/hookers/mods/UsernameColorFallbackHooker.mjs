import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class UsernameColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = (e) => {
      let stateApi = this.pimp.getApi('state')

      log.info("UsernameColorFallback", "New message arrived.")
      let usernameElement = e.findUsernameElement()

      let username = usernameElement.textContent

      let color = stateApi.getUsernameColor(username)

      if (color !== null) {
        usernameElement.style.color = color
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
