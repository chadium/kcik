export class ElapsedServerTime {
  constructor(other) {
    if (other instanceof ElapsedServerTime) {
      this._serverTime = other._serverTime
      this._when = other._when
    } else {
      this._serverTime = 0
      this._when = 0
    }
  }

  setServerTime(serverTime) {
    this._serverTime = serverTime
    this._when = Date.now()
  }

  getLastUpdate() {
    return this._when
  }

  getTweened(relativeTo = Date.now()) {
    return this._serverTime + (relativeTo - this._when)
  }
}
