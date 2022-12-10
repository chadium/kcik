import deepEqual from 'deep-equal'
import { CustomTeamDeathMatchHooker } from '../custom-matches/CustomTeamDeathMatchHooker.mjs'
import { CustomTagMatchHooker } from '../custom-matches/CustomTagMatchHooker.mjs'
import { CustomTagMatchUiHooker } from '../custom-matches/CustomTagMatchUiHooker.mjs'
import * as adminApi from '../../admin-api.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

class State extends MachineState {
  onRoomJoin(room) {
  }

  onRoomLeave() {
  }

  onCustomMatchAvailable(match) {
  }

  onCustomMatchUnavailable() {
  }
}

class StateIdle extends State {
  onRoomJoin(room) {
    if (this.machine.hooker._match !== null) {
      if (this.machine.hooker._match.roomId === room.id) {
        log.info('CustomMatchDetector', 'Joined custom match')
        this.machine.next(new StatePlayingCustomMatch(room.id, this.machine.hooker._match))
      } else {
        log.info('CustomMatchDetector', 'Joined normal match, not a custom match')
        this.machine.next(new StatePlayingNormalMatch(room.id))
      }
    } else {
      log.info('CustomMatchDetector', 'Joined normal match')
      this.machine.next(new StatePlayingNormalMatch(room.id))
    }
  }
}

class StatePlayingNormalMatch extends State {
  constructor(roomId) {
    super()
    this.roomId = roomId
  }

  onRoomLeave() {
    log.info('CustomMatchDetector', 'Left normal match')
    this.machine.next(new StateIdle())
  }

  onCustomMatchAvailable(match) {
    if (match.roomId === this.roomId) {
      log.info('CustomMatchDetector', 'Normal match turned custom')
      this.machine.next(new StatePlayingCustomMatch(this.roomId, match))
    }
  }
}

class StatePlayingCustomMatch extends State {
  constructor(roomId, match) {
    super()
    this.roomId = roomId
    this.match = match
    this.hookers = []
  }

  async [MachineState.ON_ENTER]() {
    if (this.match.type === 'tag') {
      this.hookers.push(new CustomTagMatchHooker())
      this.hookers.push(new CustomTagMatchUiHooker())
    } else if (this.match.type === 'multi-team-deathmatch') {
      this.hookers.push(new CustomTeamDeathMatchHooker())
    } else {
      throw new Error(`Unknown type ${this.match.type}`)
    }

    for (let hooker of this.hookers) {
      await this.machine.hooker._pimp.register(hooker)
    }
  }

  async [MachineState.ON_LEAVE]() {
    for (let hooker of this.hookers) {
      await this.machine.hooker._pimp.unregister(hooker)
    }

    this.hookers.length = 0
  }

  onRoomLeave() {
    log.info('CustomMatchDetector', 'Left custom match')
    this.machine.next(new StateIdle())
  }

  onCustomMatchAvailable(match) {
    // A new custom match.
    if (match.roomId === this.roomId) {
      log.info('CustomMatchDetector', 'New custom match')
      this.machine.next(new StatePlayingCustomMatch(this.roomId, match))
    } else {
      log.info('CustomMatchDetector', 'Left custom match')
      this.machine.next(new StatePlayingNormalMatch(this.roomId))
    }
  }

  onCustomMatchUnavailable() {
    log.info('CustomMatchDetector', 'Custom match turned normal')
    this.machine.next(new StatePlayingNormalMatch(this.roomId))
  }
}

export class CustomMatchDetectorHooker {
  constructor() {
    this._hookers = []
    this._matchSocket = null
    this._match = null
    this._state = new Machine({ base: State })
    this._state.hooker = this
    this._pimp = null
  }

  async hook(pimp) {
    this._pimp = pimp
    await this._state.start(new StateIdle())

    const roomApi = pimp.getApi('room')

    roomApi.on('available', ({ room }) => {
      this._state.call('onRoomJoin', room)
    })

    roomApi.on('leaved', ({ room }) => {
      this._state.call('onRoomLeave', room)
    })

    this._matchSocket = userApi.wsMatch({
      onConnect: async () => {
        this._changeMatch(await userApi.matchGet())
      },
      onUpdate: ({ match }) => {
        this._changeMatch(match)
      }
    })
  }

  async unhook(pimp) {
    await this._state.stop()

    this._matchSocket.close()
    this._matchSocket = null
  }

  _changeMatch(match) {
    if (match !== null) {
      if (this._match !== null) {
        if (!deepEqual(this._match, match)) {
          this._match = match
          this._state.call('onCustomMatchAvailable', this._match)
        } else {
          // Same match.
        }
      } else {
        this._match = match
        this._state.call('onCustomMatchAvailable', this._match)
      }
    } else {
      if (this._match !== null) {
        this._match = null
        this._state.call('onCustomMatchUnavailable')
      }
    }
  }
}
