import { Machine, MachineState } from './state-machine.mjs'

const REQUEST_TIMEOUT = Symbol('REQUEST_TIMEOUT')
const MASTERPORT_SEND = Symbol('MASTERPORT_SEND')
const CHATROOM_SEND = Symbol('CHATROOM_SEND')
const AUTH_SUCCESS_TIMEOUT = Symbol('AUTH_SUCCESS_TIMEOUT')

class StateNotAuthenticated extends MachineState {
  start(username) {
    return {
      promise: new Promise((resolve, reject) => {
        this.machine.chatroomAuthentication[MASTERPORT_SEND]({
          type: 'authRequest',
          username
        })

        this.machine.next(new StateWaitingForAuthRequest(resolve, reject, username))
      })
    }
  }
}

class StateWaitingForAuthRequest extends MachineState {
  constructor(resolve, reject, username) {
    super()
    this.resolve = resolve
    this.reject = reject
    this.username = username
    this.timer = null
  }

  [MachineState.ON_ENTER]() {
    this.timer = setTimeout(() => {
      this.reject(new Error('Auth request timeout'))
      this.machine.next(new StateNotAuthenticated())
    }, this.machine.chatroomAuthentication[REQUEST_TIMEOUT])
  }

  [MachineState.ON_LEAVE]() {
    clearTimeout(this.timer)
    this.timer = null
  }

  stop() {
    this.reject(new Error('Cancelled'))
    this.machine.next(new StateNotAuthenticated())
  }

  async masterportReceive(message) {
    switch (message.type) {
      case 'authRequestResponse':
        try {
          await this.machine.chatroomAuthentication[CHATROOM_SEND](
            message.chatroomId,
            JSON.stringify({
              type: 'auth',
              token: message.token
            })
          )

          this.machine.next(new StateWaitingForSuccess(
            this.resolve,
            this.reject
          ))
        } catch (e) {
          this.reject(e)
          this.machine.next(new StateNotAuthenticated())
        }
        break
    }
  }
}

class StateWaitingForSuccess extends MachineState {
  constructor(resolve, reject) {
    super()
    this.resolve = resolve
    this.reject = reject
    this.timer = null
  }

  [MachineState.ON_ENTER]() {
    this.timer = setTimeout(() => {
      this.reject(new Error('Auth success timeout'))
      this.machine.next(new StateNotAuthenticated())
    }, this.machine.chatroomAuthentication[AUTH_SUCCESS_TIMEOUT])
  }

  [MachineState.ON_LEAVE]() {
    clearTimeout(this.timer)
    this.timer = null
  }

  stop() {
    this.reject(new Error('Cancelled'))
    this.machine.next(new StateNotAuthenticated())
  }

  masterportReceive(message) {
    switch (message.type) {
      case 'authSuccess':
        this.resolve({
          token: message.token
        })
        this.machine.next(new StateAuthenticated())
        break
    }
  }
}

class StateAuthenticated extends MachineState {
}

export class ChatroomAuthentication {
  #sm

  constructor({
    authSuccessTimeout = 30000,
    requestTimeout = 10000,
    masterportSend,
    chatroomSend,
  }) {
    this[AUTH_SUCCESS_TIMEOUT] = authSuccessTimeout
    this[REQUEST_TIMEOUT] = requestTimeout
    this[MASTERPORT_SEND] = masterportSend
    this[CHATROOM_SEND] = chatroomSend

    this.#sm = new Machine()
    this.#sm.start(new StateNotAuthenticated())

    this.#sm.chatroomAuthentication = this
  }

  async start(username) {
    let result = await this.#sm.call('start', username)

    if (result) {
      return result.promise
    } else {
      throw new Error('Already authenticating.')
    }
  }

  async stop() {
    await this.#sm.call('stop')
  }

  masterportReceive(message) {
    return this.#sm.call('masterportReceive', message)
  }
}
