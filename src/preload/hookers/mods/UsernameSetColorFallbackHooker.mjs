import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as kickApi from '../../kick-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as colorUtils from '../../color-utils.mjs'
import { toaster } from '../../toaster.mjs'

export class UsernameSetColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = async (e) => {
      let messageElement = e.findMessageElement()

      let message = messageElement.textContent

      if (message.startsWith('!color') || message.startsWith('!colour')) {
        log.info('UsernameSetColorFallback', 'Got the color command.')

        let stateApi = this.pimp.getApi('state')

        let splitsplat = message.split(/\s+/, 2)

        let color = colorUtils.toRgbHex(splitsplat[1])

        if (color === null) {
          let command = splitsplat[0].substring('!')
          // Show message to user.
          toaster(`Invalid ${command}. Did you spell it correctly?`)
          return
        }

        let username = e.findUsernameElement().textContent

        await stateApi.setUsernameColor(
          username,
          color
        )
      }
    }
  }

  async hook() {
    let domChatMessageApi = this.pimp.getApi('domChatMessage')

    domChatMessageApi.on('sentChatMessage', this.onNewMessage)
  }

  async unhook() {
    let domChatMessageApi = this.pimp.getApi('domChatMessage')

    domChatMessageApi.off('sentChatMessage', this.onNewMessage)
  }
}
