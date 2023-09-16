import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { VideoKeyboardNavigationState } from './VideoKeyboardNavigationState.mjs'
import { WaitForVueComponentMountState } from './WaitForVueComponentMountState.mjs'
import { VueNodeAliveState } from './VueNodeAliveState.mjs'

const CLIP_VIEWER_COMPONENT_NAME = 'ClipViewerVideo'

function waitForComponentState(machine) {
  return new WaitForVueComponentMountState(CLIP_VIEWER_COMPONENT_NAME, (vm) => {
    log.info('Clips', 'A clip viewer component has been mounted.')

    machine.next(new VueNodeAliveState(
      vm,
      new VideoKeyboardNavigationState(vm.$el),
      waitForComponentState(machine)
    ))
  })
}

class DisabledState extends MachineState {}

class EnabledState extends MachineState {
  constructor() {
    super()
    this.sm = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('Clips', 'Enable vod keyboard navigation.')

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(waitForComponentState(this.sm))
  }

  async [MachineState.ON_LEAVE]() {
    log.info('Clips', 'Disable vod keyboard navigation.')

    await this.sm.stop()
  }
}

export class ClipsHooker extends Hooker {
  #sm = null
  #state = false

  async hook() {
    this.#sm = new Machine()
    this.#sm.pimp = this.pimp
    await this.#sm.start(new DisabledState())

    return {
      name: 'clips',
      api: {
        enableVodKeyboardNavigation: (state) => {
          if (this.#state === state) {
            // Do nothing
            return
          }

          this.#state  = state

          if (state) {
            this.#sm.next(new EnabledState())
          } else {
            this.#sm.next(new DisabledState())
          }
        }
      }
    }
  }

  async unhook() {
    await this.#sm.stop()
  }
}

