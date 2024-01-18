import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { hhmmss } from '../../duration-format.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { WaitForVueComponentMountState } from './WaitForVueComponentMountState.mjs'
import { VueNodeAliveState } from './VueNodeAliveState.mjs'

export class WaitingState extends MachineState {
  constructor(videoPlayerElement, id) {
    super()
    this.id = id
    this.videoPlayerElement = videoPlayerElement
    this.player = this.videoPlayerElement.player
    this.onMetadata = () => {
      this.machine.next(new TrackingState(videoPlayerElement, id))
    }
  }

  async [MachineState.ON_ENTER]() {
    if (this.player.duration() !== 0) {
      this.onMetadata()
    } else {
      this.player.on('durationchange', this.onMetadata)
    }
  }


  async [MachineState.ON_LEAVE]() {
    this.player.off('durationchange', this.onMetadata)
  }
}

export class TrackingState extends MachineState {
  constructor(videoPlayerElement, id) {
    super()
    this.id = id
    this.videoPlayerElement = videoPlayerElement
    this.player = this.videoPlayerElement.player
    this.intervalId = null
    this.track = () => {
      const chromeExtensionApi = this.machine.pimp.getApi('chromeExtension')

      const seconds = this.player.currentTime()

      chromeExtensionApi.mail('kcik.vod.currentTime.set', {
        id: this.id,
        currentTime: Math.floor(seconds * 1000)
      })
    }
  }

  async [MachineState.ON_ENTER]() {
    const chromeExtensionApi = this.machine.pimp.getApi('chromeExtension')
    const currentTime = await chromeExtensionApi.request('kcik.vod.currentTime.get', {
      id: this.id
    })
    if (currentTime !== null) {
      log.info('watchTracking', `Will resume from ${hhmmss(currentTime)}.`)
      this.player.currentTime(currentTime / 1000)
    }

    this.intervalId = setInterval(this.track, 10000)
    this.player.on('seeked', this.track)
  }

  async [MachineState.ON_LEAVE]() {
    this.player.off('seeked', this.track)
    clearInterval(this.intervalId)
  }
}

function waitForVodComponentState(machine) {
  return new WaitForVueComponentMountState('VideoPlayer', (vm) => {
    if (vm._.props.isVOD) {
      log.info('watchTracking', 'A VideoPlayer component has been mounted.')

      const videoPlayerElement = vm._.vnode.el.querySelector('.video-js')

      machine.next(new VueNodeAliveState(
        vm,
        new WaitingState(videoPlayerElement, vm._.props.vodUuid),
        waitForVodComponentState(machine)
      ))
    }
  })
}

class DisabledState extends MachineState {}

export class WatchTrackingHooker extends Hooker {
  #machine = null

  async hook() {
    this.#machine = new Machine()
    this.#machine.pimp = this.pimp
    await this.#machine.start(new DisabledState())
    await this.#machine.next(waitForVodComponentState(this.#machine))

    return {
      name: 'watchTracking',
      api: {
        setEnabled: (state) => {
          if (state) {
            this.#machine.next(waitForVodComponentState(this.#machine))
          } else {
            this.#machine.next(new DisabledState())
          }
        }
      }
    }
  }

  async unhook() {
  }
}
