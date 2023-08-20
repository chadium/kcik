export class StupidMap {
  #keys = []
  #values = []

  set(key, value) {
    var index = this.#keys.indexOf(key)
    if (index == -1) {
      this.#keys.push(key)
      this.#values.push(value)
    } else {
      this.#values[index] = value
    }
  }

  get(key) {
    return this.#values[this.#keys.indexOf(key)]
  }

  del(key) {
    var index = this.#keys.indexOf(key)
    if (index !== -1) {
      delete this.#values[index]
    }
  }
}