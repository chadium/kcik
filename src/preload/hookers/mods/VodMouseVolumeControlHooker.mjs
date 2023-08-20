import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as vueUtils from '../../vue-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { WaitForVueComponentMountState } from './WaitForVueComponentMountState.mjs'
import { MouseVolumeControlState } from './MouseVolumeControlState.mjs'
import { VueNodeAliveState } from './VueNodeAliveState.mjs'

function waitForVodComponentState(machine) {
  return new WaitForVueComponentMountState('VideoPlayer', (vm) => {
    log.info('VodMouseVolumeControl', 'A VideoPlayer component has been mounted.')

    const videoPlayerElement = vm._.vnode.el.querySelector('.video-js')

    machine.next(new VueNodeAliveState(
      vm,
      new MouseVolumeControlState(videoPlayerElement),
      waitForVodComponentState(machine)
    ))
  })
}

function waitForClipComponentState(machine) {
  return new WaitForVueComponentMountState('ClipViewerVideo', (vm) => {
    log.info('VodMouseVolumeControl', 'A ClipViewerVideo component has been mounted.')

    const videoPlayerElement = vm._.vnode.el.closest('.video-js')

    machine.next(new VueNodeAliveState(
      vm,
      new MouseVolumeControlState(videoPlayerElement),
      waitForClipComponentState(machine)
    ))
  })
}

class DisabledState extends MachineState {}

export class VodMouseVolumeControlHooker extends Hooker {
  #vodMachine = null

  #clipMachine = null

  async hook() {
    this.#vodMachine = new Machine()
    this.#vodMachine.pimp = this.pimp
    await this.#vodMachine.start(new DisabledState())

    this.#clipMachine = new Machine()
    this.#clipMachine.pimp = this.pimp
    await this.#clipMachine.start(new DisabledState())

    return {
      name: 'vodMouseVolumeControl',
      api: {
        setEnabled: (state) => {
          if (state) {
            this.#vodMachine.next(waitForVodComponentState(this.#vodMachine))
            this.#clipMachine.next(waitForClipComponentState(this.#clipMachine))
          } else {
            this.#vodMachine.next(new DisabledState())
            this.#clipMachine.next(new DisabledState())
          }
        }
      }
    }
  }

  async unhook() {
  }
}
