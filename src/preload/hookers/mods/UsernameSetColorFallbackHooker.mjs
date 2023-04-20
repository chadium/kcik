import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as kickApi from '../../kick-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as colorUtils from '../../color-utils.mjs'
import { toaster } from '../../toaster.mjs'

function sanitizeColorInput(color) {
  // May have trailing white space. May.
  color = color.trim()

  // Don't want no duplicate white space or anything that is not a space
  // character.
  color = color.replace(/\s+/g, ' ');

  return color
}

export class UsernameSetColorFallbackHooker extends Hooker {
  constructor() {
    super()

    this.onNewMessage = async (e) => {
      let usernameElement = e.findUsernameElement()

      let username = usernameElement.textContent

      let messageElement = e.findMessageElement()

      let message = messageElement.textContent

      if (message.startsWith('!color') || message.startsWith('!colour')) {
        log.info('UsernameSetColorFallback', 'Got the color command.')

        let userApi = this.pimp.getApi('user')

        if (userApi.getCurrentUsername() !== username) {
          // Nope.
          return
        }

        let stateApi = this.pimp.getApi('state')

        let firstSpace = message.indexOf(' ')

        if (firstSpace === -1) {
          // Silly user.
          toaster(`You must specify a color. (ex: !color red)`)
          return
        }

        let color = colorUtils.toRgbHex(sanitizeColorInput(message.substring(firstSpace)))

        if (color === null) {
          let command = message.substring(1, firstSpace)
          // Show message to user.
          toaster(`Invalid ${command}. Did you spell it correctly?`)
          return
        }

        await stateApi.setUsernameColor(
          color
        )
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
