import { DomRemovalDetectorInterface } from "./DomRemovalDetectorInterface.mjs"

class DomRemovalDetectorMutationObserverWithIdConnection extends DomRemovalDetectorInterface.ConnectionInterface {
  #mutationObserver

  constructor(element, cb) {
    super()

    this.#mutationObserver = new MutationObserver((mutations) => {
      if (document.getElementById(element.id) === null) {
        cb(element)
      }
    })

    this.#mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  disconnect() {
    this.#mutationObserver.disconnect()
  }
}

export class DomRemovalDetectorMutationObserverWithId extends DomRemovalDetectorInterface {
  connect(element, cb) {
    if (element.id === undefined) {
      throw new Error('The element NEEDS to have an id for this to work. Consider setting one.')
    }

    return new DomRemovalDetectorMutationObserverWithIdConnection(element, cb)
  }
}
