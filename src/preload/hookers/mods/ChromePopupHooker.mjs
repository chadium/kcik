import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class ChromePopupHooker extends Hooker {
  constructor() {
    super()

    this.port = null
    this.scriptMutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-message') {
          const newValue = mutation.target.getAttribute('data-message');
          const message = JSON.parse(newValue)
          log.info('Got message from content script', message.type)
          this.handleReceived(message.type, message.data)
        }
      });
    })
  }

  async hook() {
    let kcik = document.getElementById('kcik')

    this.scriptMutationObserver.observe(kcik, { attributes: true });

    this.send('kcik.ready', {})

    return {
      name: 'chromePopup',
      api: {
        send(type, data) {
          this.send(type, data)
        }
      }
    }
  }

  async unhook() {
    this.scriptMutationObserver.disconnect()
  }

  send(type, data) {
    log.info('Sending message to content script', type)
    postMessage({
      type,
      data
    })
  }

  handleReceived(type, data) {
    let fontSizeApi = this.pimp.getApi('fontSize')

    switch (type) {
    case 'kcik.ask':
      for (const field of data.fields) {
        switch (field) {
        case 'fontSize': {
          this.send('kcik.fontSize', fontSizeApi.getSize())
          break
        }
        }
      }
      break

    case 'kcik.fontSize.set':
      fontSizeApi.setSize(data)
      break
    }
  }
}
