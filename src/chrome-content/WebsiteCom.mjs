import EventEmitter from 'events'

export class WebsiteCom {
  constructor(injection) {
    this.injection = injection
    this.events = new EventEmitter()

    window.addEventListener('message', (e) => {
      if (e.origin === 'https://kick.com') {
        if (e.data.type !== undefined) {
          this.events.emit('message', e.data)
        }
      }
    })
  }

  on(type, cb) {
    this.events.on(type, cb)
  }

  off(type, cb) {
    this.events.off(type, cb)
  }

  send(type, data) {
    let message = {
      type,
      data
    }

    try {
      this.injection.sendMessage(message)
    } catch (e) {
      this.events.emit('error', e)
    }
  }
}
