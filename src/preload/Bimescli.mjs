class Waiter {
  constructor(id, timeout, resolve, reject, waiters) {
    this.id = id
    this.resolve = resolve
    this.timeoutId = setTimeout(() => {
      waiters.delete(id)
      reject(new BimescliTimeoutError(`No response for ${id}.`))
    }, timeout)
  }

  cancel() {
    clearTimeout(this.timeoutId)
  }
}

export class BimescliTimeoutError extends Error {}

export class Bimescli {
  constructor({
    output,
    onMail,
    onRequest,
    onIgnore,
    timeout = 30000,
  }) {
    this.nextId = 1
    this.output = output
    this.onMail = onMail
    this.onRequest = onRequest
    this.onIgnore = onIgnore
    this.waiters = new Map()
    this.timeout = timeout
  }

  close() {
    for (let waiter of this.waiters.values()) {
      waiter.cancel()
    }

    this.waiter = null
  }

  mail(data) {
    this.output({
      id: this.nextId++,
      type: 'mail',
      data
    })
  }

  async request(data) {
    const id = this.nextId++

    const promise = new Promise((resolve, reject) => {
      this.waiters.set(id, new Waiter(id, this.timeout, resolve, reject, this.waiters))
    })

    this.output({
      id,
      type: 'request',
      data
    })

    return promise
  }

  async input(message) {
    if (message.type === 'reply') {
      const waiter = this.waiters.get(message.id)

      if (waiter === undefined) {
        // Not for me.
        if (this.onIgnore) {
          this.onIgnore(message)
        }
        return
      }

      this.waiters.delete(message.id)
      waiter.cancel()
      waiter.resolve(message.data)
    } else if (message.type === 'mail') {
      if (this.onMail) {
        this.onMail(message.data)
      }
    } else if (message.type === 'request') {
      if (this.onRequest) {
        const replyData = await this.onRequest(message.data)

        if (replyData !== undefined) {
          this.output({
            id: message.id,
            type: 'reply',
            data: replyData
          })
        }
      }
    }
  }

  pending() {
    return [...this.waiters.keys()]
  }
}