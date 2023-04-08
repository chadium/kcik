import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class UsernameSetColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = (e) => {
      //let stateApi = this.pimp.getApi('state')

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
