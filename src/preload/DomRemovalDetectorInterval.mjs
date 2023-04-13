
import { DomRemovalDetectorInterface } from "./DomRemovalDetectorInterface.mjs"

class DomRemovalDetectorIntervalConnection extends DomRemovalDetectorInterface.ConnectionInterface {
  #timer

  constructor(timer) {
    super()

    this.#timer = timer
  }

  disconnect() {
    clearInterval(this.#timer)
  }
}

export class DomRemovalDetectorInterval extends DomRemovalDetectorInterface {
  connect(element, cb) {
    let timer = setInterval(() => {
      let current = element
      while (current.parentElement !== null) {
        current = current.parentElement
    
        if (current === document.body) {
          // Still attached.
          return
        }
      }

      cb(element)
    }, 1000 * 5)

    return new DomRemovalDetectorIntervalConnection(timer)
  }
}
