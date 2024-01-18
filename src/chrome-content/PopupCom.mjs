import { Bimescli } from '../preload/Bimescli.mjs';

export class PopupCom {
  constructor({
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
    this.port = null

    chrome.runtime.onConnect.addListener((p) => {
      this.port = p

      this.port.onMessage.addListener((message) => {
        this.client.input(message)
      })

      this.port.onDisconnect.addListener(() => {
        this.port = null
      })
    });
  }

  mail(type, data) {
    if (this.port === null) {
      return
    }

    let message = {
      type,
      data
    }

    this.client.mail(message)
  }

  async request(type, data) {
    if (this.port === null) {
      return
    }

    let message = {
      type,
      data
    }

    return await this.client.request(message)
  }
}