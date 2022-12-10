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

  async unregister(hooker) {
    let index = this._hookers.indexOf(hooker)

    if (index === -1) {
      // Not registered.
      return
    }

    this._hookers.splice(index, 1)

    await hooker.unhook(this)
  }

  getApi(name) {
    if (this._apis[name] === undefined) {
      throw new Error(`No api ${name}`)
    }

    return this._apis[name]
  }
}
