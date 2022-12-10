import EventEmitter from 'events'
import { Machine, MachineState } from '../../state-machine.mjs'
import * as log from '../../log.mjs'

class StateLoaded extends MachineState {
  [MachineState.ON_ENTER]() {
    log.info('Dom', 'Loaded.')
    this.machine.hooker._events.emit('headAvailable')
    this.machine.hooker._events.emit('bodyAvailable')
  }
}

class StateWaiting extends MachineState {
  constructor() {
    super()
    this._onLoaded = async (e) => {
      log.info('Dom', 'DOMContentLoaded')
      await this.machine.next(new StateLoaded())
    }
  }

  [MachineState.ON_ENTER]() {
    addEventListener('DOMContentLoaded', this._onLoaded)
  }

  [MachineState.ON_LEAVE]() {
    removeEventListener('DOMContentLoaded', this._onLoaded)
  }
}

export class DomHooker {
  constructor() {
    this._vueApp = null
    this._events = new EventEmitter()
    this._state = new Machine()
    this._state.hooker = this
    this._injectionPoint = document.createElement('div')
    this._injectionPoint.classList.add('boomer-root', 'boomer-dark')
    this._onRemove = []
  }

  async hook(pimp) {
    if (document.body !== null) {
      log.info('Dom', 'Body element is already loaded')
      await this._state.start(new StateLoaded())
    } else {
      log.info('Dom', 'Body element not found.')
      await this._state.start(new StateWaiting())
    }

    this._events.on('newListener', (name, listener) => {
      if (name === 'bodyAvailable') {
        if (document.body !== null) {
          // Already available. Call it.
          listener()
        }
      } else if (name === 'headAvailable') {
        if (document.head !== null) {
          // Already available. Call it.
          listener()
        }
      }
    })

    this._events.on('bodyAvailable', () => {
      document.body.append(this._injectionPoint)
    })

    return {
      name: 'dom',
      api: {
        getHeadElement: () => document.head,
        getBodyElement: () => document.body,
        addElement: ({ onRemove } = {}) => {
          let root = document.createElement('div')

          this._events.on('bodyAvailable', () => {
            this._injectionPoint.append(root)
          })

          if (onRemove) {
            this._onRemove.push(onRemove)
          }

          return root
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  async unhook(pimp) {
    this._events.removeAllListeners()

    for (let onRemove of this._onRemove) {
      await onRemove()
    }

    this._injectionPoint.remove()
  }
}
