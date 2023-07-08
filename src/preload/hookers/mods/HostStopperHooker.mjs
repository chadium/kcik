import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { toaster } from '../../toaster.mjs'

const HOST_EVENT = 'App\\Events\\ChatMoveToSupportedChannelEvent'

class DisabledState extends MachineState {}

class EnabledState extends MachineState {
  constructor() {
    super()
    this.sm = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('HostStopper', 'Prevent hosts.')

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(new UnknownState())
  }

  async [MachineState.ON_LEAVE]() {
    log.info('HostStopper', 'Allow hosts.')

    await this.sm.stop()
  }
}

class UnknownState extends MachineState {
  async [MachineState.ON_ENTER]() {
    let echoApi = this.machine.pimp.getApi('echo')

    let streamerChannels = echoApi.getStreamerChannels()

    if (streamerChannels.length > 0) {
      this.machine.next(new ChannelState(streamerChannels[0]))
    } else {
      this.machine.next(new WaitingState())
    }
  }
}

class ChannelState extends MachineState {
  constructor(channel) {
    super()
    this.sm = null
    this.channel = channel
    this.onUnsubscribe = ({ channel }) => {
      if (channel === this.channel.name) {
        this.machine.next(new WaitingState())
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    this.sm.channel = this.channel
    this.sm.start(new ChannelHostDisableState())

    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.on('streamerUnsubscribe', this.onUnsubscribe)
  }

  async [MachineState.ON_LEAVE]() {
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.off('streamerUnsubscribe', this.onUnsubscribe)
  }
}

class ChannelHostDisableState extends MachineState {
  constructor() {
    super()
    this.eventHandlers = null

    this.onHost = {
      fn: () => {
        toaster('Prevented a host!')
      },
      context: undefined
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('HostStopper', 'Hosts disabled')
    let echoApi = this.machine.pimp.getApi('echo')
    this.eventHandlers = echoApi.getChannelEventHandlers(this.machine.channel, HOST_EVENT)

    this.eventHandlers.forEach(echoApi.removeChannelEventHandler.bind(null, this.machine.channel, HOST_EVENT))

    echoApi.addChannelEventHandler(this.machine.channel, HOST_EVENT, this.onHost)
  }

  async [MachineState.ON_LEAVE]() {
    log.info('HostStopper', 'Hosts enabled')
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.removeChannelEventHandler(this.machine.channel, HOST_EVENT, this.onHost)

    for (let eventHandler of this.eventHandlers) {
      echoApi.addChannelEventHandler(this.machine.channel, HOST_EVENT, eventHandler)
    }
  }
}

class WaitingState extends MachineState {
  constructor(channel) {
    super()
    this.channel = channel
    this.eventHandlers = null
    this.onSubscribe = ({ channel }) => {
      let echoApi = this.machine.pimp.getApi('echo')

      this.machine.next(new ChannelState(echoApi.getChannel(channel)))
    }
  }

  async [MachineState.ON_ENTER]() {
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.on('streamerSubscribe', this.onSubscribe)
  }

  async [MachineState.ON_LEAVE]() {
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.off('streamerSubscribe', this.onSubscribe)
  }
}

export class HostStopperHooker extends Hooker {
  #sm = null

  constructor() {
    super()
  }

  async hook() {
    this.#sm = new Machine()
    this.#sm.pimp = this.pimp
    await this.#sm.start(new DisabledState())

    return {
      name: 'hostStopper',
      api: {
        enableHost: (state) => {
          if (state) {
            this.#sm.next(new DisabledState())
          } else {
            this.#sm.next(new EnabledState())
          }
        }
      }
    }
  }

  unhook() {
  }
}
