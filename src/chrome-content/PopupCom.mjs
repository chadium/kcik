import EventEmitter from 'events'

export class PopupCom {
  constructor() {
    this.port = null
    this.events = new EventEmitter()

    chrome.runtime.onConnect.addListener((p) => {
      this.port = p

      this.port.onMessage.addListener((message) => {
        this.events.emit('message', message)
      })

      this.port.onDisconnect.addListener(() => {
        this.port = null
      })
    });
  }

  on(type, cb) {
    this.events.on(type, cb)
  }

  off(type, cb) {
    this.events.off(type, cb)
  }

  send(type, data) {
    if (this.port === null) {
      return
    }

    let message = {
      type,
      data
    }

    try {
      this.port.postMessage(message)
    } catch (e) {
      this.events.emit('error', e)
    }
  }
}