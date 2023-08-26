import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { WaitForVueComponentMountState } from './WaitForVueComponentMountState.mjs'
import { PlaybackSpeedControlState } from './PlaybackSpeedControlState.mjs'
import { VueNodeAliveState } from './VueNodeAliveState.mjs'

function waitForVodComponentState(machine) {
  return new WaitForVueComponentMountState('VideoPlayer', (vm) => {
    if (vm._.props.isVOD) {
      log.info('vodPlaybackSpeed', 'A VideoPlayer component has been mounted.')

      const videoPlayerElement = vm._.vnode.el.querySelector('.video-js')

      machine.next(new VueNodeAliveState(
        vm,
        new PlaybackSpeedControlState(videoPlayerElement),
        waitForVodComponentState(machine)
      ))
    }
  })
}

class DisabledState extends MachineState {}

export class VodPlaybackSpeedHooker extends Hooker {
  #machine = null

  async hook() {
    this.#machine = new Machine()
    this.#machine.pimp = this.pimp
    await this.#machine.start(new DisabledState())

    return {
      name: 'vodPlaybackSpeed',
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
