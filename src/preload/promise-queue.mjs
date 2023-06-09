export class PromiseQueue {
  constructor() {
    this.queue = []
    this.running = false
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      if (!this.running) {
        this.running = true
        this.#processQueue()
      }
    })
  }

  async #processQueue() {
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift()
      try {
        const result = await task()
        resolve(result)
      } catch (e) {
        reject(e)
      }
    }
    this.running = false
  }
}
