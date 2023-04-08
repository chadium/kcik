import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { lookForElement } from '../../dom-utils.mjs'
import EventEmitter from 'events'

const MESSAGE_CONTAINER_ID = 'messagesContainer'

class StateWaitForBody extends MachineState {
  constructor() {
    super()

    this.onBodyAvailable = async () => {
      this.machine.next(new StateUnknown())
    }
  }

  async [MachineState.ON_ENTER]() {
    let domApi = this.machine.hooker.pimp.getApi('dom')

    domApi.on('bodyAvailable', this.onBodyAvailable)
  }

  async [MachineState.ON_LEAVE]() {
    let domApi = this.machine.hooker.pimp.getApi('dom')

    domApi.off('bodyAvailable', this.onBodyAvailable)
  }
}

class StateUnknown extends MachineState {
  async [MachineState.ON_ENTER]() {
    if (document.body === null) {
      this.machine.next(new StateWaitForBody())
    } else {
      let messagesContainer = document.getElementById(MESSAGE_CONTAINER_ID)

      if (messagesContainer !== null) {
        log.info("UsernameColorFallback", "Found chat box.")
        this.machine.next(new StateChatting())
      } else {
        log.info("UsernameColorFallback", "Couldn't find chat box. Will wait for it.")
        this.machine.next(new StateWaitingForChat())
      }
    }
  }
}

class StateChatting extends MachineState {
  #mutationObserver = null

  constructor() {
    super()

    this.#mutationObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              this.machine.hooker.events.emit('chatMessage', {
                rootElement: addedNode,

                findUsernameElement() {
                  let usernameElement = addedNode.querySelector('span[style^=color]')
    
                  return usernameElement
                }
              })
            }
          }
        }
      }
    })
  }

  async [MachineState.ON_ENTER]() {
    let messagesContainer = document.getElementById(MESSAGE_CONTAINER_ID)

    this.#mutationObserver.observe(messagesContainer, {
      childList: true,
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.#mutationObserver.disconnect()
  }
}

class StateWaitingForChat extends MachineState {
  #mutationObserver = null

  constructor() {
    super()

    this.#mutationObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              if (lookForElement(addedNode, (el) => el.id === MESSAGE_CONTAINER_ID)) {
                log.info("UsernameColorFallback", "Found message container.")
                this.machine.next(new StateChatting())
                return
              }
            }
          }
        } else if (mutation.type === 'attributes') {
          console.log('attribute change', mutation.target.id)
        }
      }
    })
  }

  async [MachineState.ON_ENTER]() {
    this.#mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["id"]
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.#mutationObserver.disconnect()
  }
}

export class DomChatMessageHooker extends Hooker {
  #sm

  constructor() {
    super()

    this.events = new EventEmitter()
    this.#sm = new Machine()
    this.#sm.hooker = this
  }

  async hook() {
    await this.#sm.start(new StateUnknown())

    return {
      name: 'domChatMessage',
      api: {
        on: (type, cb) => this.events.on(type, cb),
        off: (type, cb) => this.events.off(type, cb)
      }
    }
  }

  async unhook(pimp) {
    await this.#sm.stop()
  }
}
