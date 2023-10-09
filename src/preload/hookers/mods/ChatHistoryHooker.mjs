import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as domUtils from '../../dom-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { WaitForVueComponentMountState } from './WaitForVueComponentMountState.mjs'
import { VueNodeAliveState } from './VueNodeAliveState.mjs'
import { ChatHistory } from '../../chat-history.mjs'
import { updowncontrol } from '../../updowncontrol.mjs'

function createEmoteImg(id, name) {
  const img = document.createElement('img')
  img.setAttribute('class', 'gc-emote-c')
  img.setAttribute('data-emote-id', id)
  img.setAttribute(':data-emote-name', name)
  img.setAttribute('src', window.cloudfrontUrl + '/emotes/ ' + encodeURIComponent(id) + '/fullsize')
  return img
}

function createEmoteImgString(id, name) {
  return `<img :data-emote-name="${domUtils.escapeHtml(name)}" class="gc-emote-c" data-emote-id="${domUtils.escapeHtml(id)}" src="${domUtils.escapeHtml(window.cloudfrontUrl + '/emotes/' + encodeURIComponent(id) + '/fullsize')}">`
}

function embedEmotes(message) {
  let regexp = /\[emote:(.+?):(.+?)\]/g

  for (let entry of message.matchAll(regexp)) {
    let replacementString = entry[0]
    let id = entry[1]
    let name = entry[2]
    let img = createEmoteImgString(id, name)
    message = message.replaceAll(replacementString, img);
  }

  return message
}

const history = new ChatHistory()

class ChatInputState extends MachineState {
  constructor(vm) {
    super()
    this.vm = vm
    this.updowncontrol = null
  }

  async [MachineState.ON_ENTER]() {
    history.bottom()

    this.updowncontrol = updowncontrol({
      container: this.vm.vnode.component.refs.messageInput,
      onUp: () => {
        history.up()

        const message = embedEmotes(history.get() ?? '')

        this.vm.vnode.component.refs.messageInput.innerHTML = message
      },
      onDown: () => {
        history.down()

        const message = embedEmotes(history.get() ?? '')

        this.vm.vnode.component.refs.messageInput.innerHTML = message
      },
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.updowncontrol.destroy()
    this.updowncontrol = null
  }
}

function waitForVodComponentState(machine) {
  console.log('chat history')
  return new WaitForVueComponentMountState('ChatroomInput', (vm) => {
    log.info('ChatHistory', 'The chatroom input has been mounted.')

    machine.next(new VueNodeAliveState(
      vm,
      new ChatInputState(vm._),
      waitForVodComponentState(machine)
    ))
  })
}

export class ChatHistoryHooker extends Hooker {
  machine = null

  async hook() {
    this.machine = new Machine()
    this.machine.pimp = this.pimp
    await this.machine.start(waitForVodComponentState(this.machine))

    const piniaApi = this.pimp.getApi('pinia')

    piniaApi.on('available', () => {
      const chatroomState = piniaApi.getModuleState('chatroomv2')

      piniaApi.replaceModuleFunction('chatroomv2', 'sendCurrentMessage', ({ originalFunction, args}) => {
        const message = chatroomState.currentMessage.trim()

        if (message === '') {
          // Apparently this function is called even when the current message
          // is empty.
          return
        }

        history.push(chatroomState.currentMessage)
        return originalFunction(...args)
      })
    })
  }

  async unhook() {
  }
}
