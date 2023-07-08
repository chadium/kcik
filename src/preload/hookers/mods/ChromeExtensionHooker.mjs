import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import EventEmitter from 'events'

export class ChromeExtensionHooker extends Hooker {
  constructor() {
    super()

    this.events = new EventEmitter()

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

    const initialData = JSON.parse(kcik.getAttribute('data-message'))

    this.send('kcik.ready', {})

    this.pimp.getApi('websiteTheme').setWebsiteTheme(initialData.websiteTheme)
    this.pimp.getApi('clips').enableVodKeyboardNavigation(initialData.enableVodKeyboardNavigation)
    this.pimp.getApi('vod').enableVodKeyboardNavigation(initialData.enableVodKeyboardNavigation)
    this.pimp.getApi('fontSize').setSize(initialData.fontSize)
    this.pimp.getApi('hostStopper').enableHost(initialData.enableHost)

    return {
      name: 'chromeExtension',
      api: {
        send: (type, data) => {
          this.send(type, data)
        },
        on: (type, cb) => this.events.on(type, cb),
        off: (type, cb) => this.events.off(type, cb),
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
    switch (type) {
    case 'kcik.ask':
      for (const field of data.fields) {
        switch (field) {
        case 'usernameColor': {
          let userApi = this.pimp.getApi('user')
          let color = this.pimp.getApi('state').getUsernameColor(userApi.getCurrentUsername())

          this.send('kcik.usernameColor', color)
          break
        }
        }
      }
      break

    case 'kcik.fontSize': {
      let fontSizeApi = this.pimp.getApi('fontSize')
      fontSizeApi.setSize(data)
      break
    }

    case 'kcik.websiteTheme': {
      let websiteThemeApi = this.pimp.getApi('websiteTheme')
      websiteThemeApi.setWebsiteTheme(data)
      break
    }

    case 'kcik.enableHost': {
      let hostStopperApi = this.pimp.getApi('hostStopper')
      hostStopperApi.enableHost(data)
      break
    }

    case 'kcik.enableVodKeyboardNavigation': {
      let vodApi = this.pimp.getApi('vod')
      vodApi.enableVodKeyboardNavigation(data)
      let clipsApi = this.pimp.getApi('clips')
      clipsApi.enableVodKeyboardNavigation(data)
      break
    }

    case 'kcik.usernameColor.set':
      console.log(data)
      this.pimp.getApi('state').setUsernameColor(data)
      break
    }
  }
}
