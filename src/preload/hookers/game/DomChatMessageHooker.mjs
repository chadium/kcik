import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { lookForElement } from '../../dom-utils.mjs'
import EventEmitter from 'events'
import { DomRemovalDetectorMutationObserverWithId } from '../../DomRemovalDetectorMutationObserverWithId.mjs'

const CHATROOM_TOP_ID = 'chatroom-top'
const CHECK_INTERVAL = 1000 * 30

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
      let messagesContainer = document.getElementById(CHATROOM_TOP_ID)

      if (messagesContainer !== null) {
        log.info("DomChatMessage", "Found chat box.")
        this.machine.next(new StateChatting())
      } else {
        log.info("DomChatMessage", "Couldn't find chat box. Will wait for it.")
        this.machine.next(new StateWaitingForChat())
      }
    }
  }
}

class StateChatting extends MachineState {
  #chatMessageObserver = null
  #chatContainerDetector = null

  constructor() {
    super()

    this.#chatMessageObserver = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              if (addedNode.dataset.chatEntry) {
                let e = {
                  rootElement: addedNode,

                  findUsernameElement() {
                    let usernameElement = addedNode.querySelector('.chat-entry-username')

                    return usernameElement
                  },

                  findMessageElement() {
                    let chatMessageIdentityElement = addedNode.querySelector('.chat-message-identity')

                    let colonElement = chatMessageIdentityElement.nextElementSibling

                    let messageElement = colonElement.nextElementSibling

                    return messageElement
                  }
                }

                if (addedNode.dataset.chatEntry.startsWith('temp_')) {
                  this.machine.hooker.events.emit('sentChatMessage', e)
                }

                this.machine.hooker.events.emit('chatMessage', e)
              }
            }
          }
        }
      }
    })
  }

  async [MachineState.ON_ENTER]() {
    let chatroomTop = document.getElementById(CHATROOM_TOP_ID)

    let wrapper = chatroomTop.nextSibling
    let messagesContainer = wrapper.children[0]

    let detector = new DomRemovalDetectorMutationObserverWithId()

    this.#chatContainerDetector = detector.connect(chatroomTop, () => {
      log.info("DomChatMessage", "Chat container gone. Must look for it again.")
      this.machine.next(new StateWaitingForChat())
    })

    this.#chatMessageObserver.observe(messagesContainer, {
      childList: true
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.#chatContainerDetector.disconnect()
    this.#chatMessageObserver.disconnect()
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
              if (lookForElement(addedNode, (el) => el.id === CHATROOM_TOP_ID)) {
                log.info("DomChatMessage", "Found message container.")
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
    let messagesContainer = document.getElementById(CHATROOM_TOP_ID)

    if (messagesContainer !== null) {
      // That means it's already attached. Let's gooo.
      // And yes, we do need to check again because these
      // state messages are asynchronous.
      log.info("DomChatMessage", "Message container was already present.")
      this.machine.next(new StateChatting())
    } else {
      this.#mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["id"]
      })
    }
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
