import { Bimescli } from '../preload/Bimescli.mjs';

export class WebsiteCom {
  constructor({
    injection,
    onMail,
    onRequest,
  }) {
    this.client = new Bimescli({
      timeout: 10000,
      output: (message) => {
        this.injection.sendMessage(message)
      },
      onMail: (data) => onMail(data.type, data.data),
      onRequest: (data) => onRequest(data.type, data.data),
    })
    this.injection = injection

    window.addEventListener('message', (e) => {
      if (e.origin === 'https://kick.com') {
        if (e.data.type !== undefined) {
          this.client.input(e.data)
        }
      }
    })
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
