
const SET_PIMP = Symbol()

export class Hooker {
  constructor() {
    this.pimp = null
  }

  [SET_PIMP](pimp) {
    this.pimp = pimp
  }

  async hook() {
    // Hooks into the game. This is also the perfect time to expose an API for
    // pimp clients.
  }

  async unhook() {
    // Removes itself from the game.
    // Please clean up after yourself.
  }
}

export class Pimp {
  constructor() {
    this._apis = {}
    this._hookers = []
  }

  async register(hooker) {
    hooker[SET_PIMP](this)

    let info = await hooker.hook(this)

    this._hookers.push()

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

    await hooker.unhook()

    hooker[SET_PIMP](null)

    // TODO: Remove its API.
  }

  getApi(name) {
    if (this._apis[name] === undefined) {
      throw new Error(`No api ${name}`)
    }

    return this._apis[name]
  }
}
