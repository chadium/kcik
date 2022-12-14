export class ElapsedServerTime {
  constructor() {
    this._serverTime = 0
    this._when = 0
  }

  setServerTime(serverTime) {
    this._serverTime = serverTime
    this._when = Date.now()
  }

  getElapsed(relativeTo = Date.now()) {
    return this._serverTime - (relativeTo - this._when)
  }
}
