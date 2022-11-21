export class Pimp {
  constructor() {
    this._apis = {}
    this._hookers = []
  }

  async register(hooker) {
    let info = await hooker.hook(this)

    this._hookers.push(hooker)

    if (info) {
      // Expecting an API.
      this._apis[info.name] = info.api
    }
  }

  async getApi(name) {
    if (!this._apis[info.name]) {
      throw new Error(`No api ${name}`)
    }

    return this._apis[info.name]
  }
}
