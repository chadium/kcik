import { Bimescli } from '../preload/Bimescli.mjs';

export class ContentCom {
  constructor({
    port,
    onMail,
    onRequest,
  }) {
    this.client = new Bimescli({
      timeout: 10000,
      output: (message) => {
        this.port.postMessage(message)
      },
      onMail: (data) => onMail(data.type, data.data),
      onRequest: (data) => onRequest(data.type, data.data),
    })
    this.port = port

    this.port.onMessage.addListener((message) => {
      this.client.input(message)
    })
  }

  on(type, cb) {
    this.events.on(type, cb)
  }

  off(type, cb) {
    this.events.off(type, cb)
  }

  mail(type, data) {
    let message = {
      type,
      data
    }

    this.client.mail(message)
  }

  async request(type, data) {
    let message = {
      type,
      data
    }

    return await this.client.request(message)
  }
}