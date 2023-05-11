import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

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
    this.channel = channel
    this.eventHandlers = null
  }

  async [MachineState.ON_ENTER]() {
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.on('streamerUnsubscribe', ({ channel }) => {
      if (channel === this.channel.name) {
        this.machine.next(new WaitingState())
      }
    })

    const type = 'App\\Events\\ChatMoveToSupportedChannelEvent'

    this.eventHandlers = echoApi.getChannelEventHandlers(this.channel, type)

    this.eventHandlers.forEach(echoApi.removeChannelEventHandler.bind(null, this.channel, type))
  }
}

class WaitingState extends MachineState {
  async [MachineState.ON_ENTER]() {
    let echoApi = this.machine.pimp.getApi('echo')

    echoApi.on('streamerSubscribe', ({ channel }) => {
      this.machine.next(new ChannelState(echoApi.getChannel(channel)))
    })
  }
}

export class HostStopperHooker extends Hooker {
  #sm = null

  constructor() {
    super()
  }

  async hook() {
    this.sm = new Machine()
    this.sm.pimp = this.pimp
    await new Promise((resolve) => setTimeout(resolve, 2000))
    await this.sm.start(new UnknownState())
  }

  unhook() {
  }
}
