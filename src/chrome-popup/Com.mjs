import EventEmitter from 'events'

export class Com {
  constructor(port) {
    this.port = port
    this.events = new EventEmitter()

    this.port.onMessage.addListener((message) => {
      this.events.emit(message.type, message.data)
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
      this.port.postMessage(message)
    } catch (e) {
      this.events.emit('error', e)
    }
  }
}