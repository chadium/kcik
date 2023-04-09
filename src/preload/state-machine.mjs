import PQueue from 'p-queue'; 

const SET_MACHINE = Symbol()
const ON_ENTER = Symbol()
const ON_LEAVE = Symbol()
const ON_STOP = Symbol()

export class MachineState {
  static ON_ENTER = ON_ENTER

  static ON_LEAVE = ON_LEAVE

  static ON_STOP = ON_STOP

  constructor() {
    this.machine = null
  }

  [SET_MACHINE](machine) {
    this.machine = machine
  }

  async [ON_ENTER]() {
  }

  async [ON_LEAVE]() {
  }

  async [ON_STOP]() {
  }
}

export class Machine {
  constructor({ base = MachineState } = {}) {
    this._state = null
    this._queue = new PQueue({ concurrency: 1 })
    this._base = base
  }

  async isRunning() {
    return await this._queue.add(async () => {
      return this._state !== null
    })
  }

  async start(initialState) {
    await this._queue.add(async () => {
      if (this._state !== null) {
        throw new Error('Already started')
      }

      if (!(initialState instanceof this._base)) {
        throw new Error('Must be an instance of MachineState')
      }

      this._state = initialState
      this._state[SET_MACHINE](this)

      await this._state[MachineState.ON_ENTER]()
    })
  }

  async next(state) {
    await this._queue.add(async () => {
      if (this._state === null) {
        throw new Error('Has not started')
      }

      if (!(state instanceof this._base)) {
        throw new Error('Must be an instance of MachineState')
      }

      await this._state[MachineState.ON_LEAVE]()

      this._state = state
      this._state[SET_MACHINE](this)

      await this._state[MachineState.ON_ENTER]()
    })
  }

  async stop() {
    await this._queue.add(async () => {
      if (this._state === null) {
        throw new Error('Already stoppped')
      }

      await this._state[MachineState.ON_LEAVE]()
      await this._state[MachineState.ON_STOP]()

      this._state = null
    })
  }

  async state() {
    return await this._queue.add(async () => {
      return this._state
    })
  }

  async call(method, ...args) {
    return await this._queue.add(async () => {
      if (typeof this._state[method] !== 'function') {
        return
      }

      return this._state[method](...args)
    })
  }
}
