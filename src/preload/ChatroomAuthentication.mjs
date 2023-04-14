import { Machine, MachineState } from './state-machine.mjs'

const REQUEST_TIMEOUT = Symbol('REQUEST_TIMEOUT')
const MASTERPORT_SEND = Symbol('MASTERPORT_SEND')
const CHATROOM_SEND = Symbol('CHATROOM_SEND')
const AUTH_SUCCESS_TIMEOUT = Symbol('AUTH_SUCCESS_TIMEOUT')

class StateNotAuthenticated extends MachineState {
  start() {
    return {
      promise: new Promise((resolve, reject) => {
        this.machine.next(new StateWaitingForAuthRequest(resolve, reject))
      })
    }
  }
}

class StateWaitingForAuthRequest extends MachineState {
  constructor(resolve, reject) {
    super()
    this.resolve = resolve
    this.reject = reject
    this.timer = null
  }

  async [MachineState.ON_ENTER]() {
    this.timer = setTimeout(() => {
      this.reject(new Error('Auth request timeout'))
      this.machine.next(new StateNotAuthenticated())
    }, this.machine.chatroomAuthentication[REQUEST_TIMEOUT])

    ;(async () => {
      try {
        await this.machine.chatroomAuthentication[MASTERPORT_SEND]({
          type: 'authRequest'
        })
      } catch (e) {
        this.reject(e)
        this.machine.next(new StateNotAuthenticated())
      }
    })()
  }

  [MachineState.ON_LEAVE]() {
    clearTimeout(this.timer)
    this.timer = null
  }

  abort() {
    this.reject(new Error('Cancelled'))
    this.machine.next(new StateNotAuthenticated())
  }

  async masterportReceive(message) {
    switch (message.type) {
      case 'authRequestResponse':
        this.machine.next(new StateWaitingForSuccess(
          this.resolve,
          this.reject,
          message.token,
          message.chatroomId
        ))
        break
    }
  }
}

class StateWaitingForSuccess extends MachineState {
  constructor(resolve, reject, intermediateToken, chatroomId) {
    super()
    this.resolve = resolve
    this.reject = reject
    this.intermediateToken = intermediateToken
    this.chatroomId = chatroomId
    this.timer = null
  }

  async [MachineState.ON_ENTER]() {
    this.timer = setTimeout(() => {
      this.reject(new Error('Auth success timeout'))
      this.machine.next(new StateNotAuthenticated())
    }, this.machine.chatroomAuthentication[AUTH_SUCCESS_TIMEOUT])

    ;(async () => {
      try {
        await this.machine.chatroomAuthentication[CHATROOM_SEND](
          this.chatroomId,
          JSON.stringify({
            type: 'auth',
            token: this.intermediateToken
          })
        )
      } catch (e) {
        this.reject(e)
        this.machine.next(new StateNotAuthenticated())
      }
    })()
  }

  [MachineState.ON_LEAVE]() {
    clearTimeout(this.timer)
    this.timer = null
  }

  abort() {
    this.reject(new Error('Cancelled'))
    this.machine.next(new StateNotAuthenticated())
  }

  masterportReceive(message) {
    switch (message.type) {
      case 'authSuccess':
        this.resolve({
          token: message.token
        })
        this.machine.next(new StateAuthenticated(message.token))
        break
    }
  }
}

class StateAuthenticated extends MachineState {
  constructor(token) {
    super()
    this.token = token
  }

  abort() {
    this.machine.next(new StateNotAuthenticated())
  }

  getToken() {
    return this.token
  }
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

  async fetch() {
    let result = await this.#sm.call('start')

    if (result) {
      return result.promise
    } else {
      throw new Error('Already authenticating.')
    }
  }

  async use(fn) {
    let result = {
      token: await this.#sm.call('getToken')
    }

    if (result.token === undefined) {
      // Gotta get it.
      result = await this.fetch()
    }

    try {
      return await fn(result)
    } catch (e) {
      // Try fetching again.
      await this.abort()
      result = await this.fetch()

      // Now try again.
      return await fn(result)
    }
  }

  async abort() {
    await this.#sm.call('abort')
  }

  masterportReceive(message) {
    return this.#sm.call('masterportReceive', message)
  }
}
