export class ChatHistory {
  constructor({
    storage = [],
    limit = 100
  } = {}) {
    this.limit = limit
    this.storage = storage
    this.pointer = null
  }

  up() {
    if (this.pointer === null) {
      this.pointer = this.storage.length - 1
    } else {
      this.pointer = this.pointer - 1
    }
  }

  down() {
    if (this.pointer === null) {
      // Do nothing.
    } else {
      this.pointer = this.pointer + 1
    }
  }

  bottom() {
    this.pointer = null
  }

  get() {
    if (this.pointer < 0) {
      this.pointer = 0
    } else if (this.pointer >= this.storage.length) {
      this.pointer = this.storage.length
    }

    return this.storage[this.pointer] ?? null
  }

  push(message) {
    if (this.#peek() !== message) {
      this.storage.push(message)

      if (this.storage.length > this.limit) {
        this.storage.shift()
      }
    }

    this.bottom()
  }

  #peek() {
    return this.storage[this.storage.length - 1]
  }
}
