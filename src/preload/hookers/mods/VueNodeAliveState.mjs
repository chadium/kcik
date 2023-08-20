import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

export class VueNodeAliveState extends MachineState {
  constructor(vm, insideState, nextState) {
    super()
    this.sm = null
    this.insideState = insideState
    this.vm = vm
    this.onRemove = () => {
      this.machine.next(nextState)
    }
  }

  async [MachineState.ON_ENTER]() {
    let vueComponentApi = this.machine.pimp.getApi('vueComponent')
    vueComponentApi.addOnRemove(this.vm, this.onRemove)

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(this.insideState)
  }

  async [MachineState.ON_LEAVE]() {
    let vueComponentApi = this.machine.pimp.getApi('vueComponent')
    vueComponentApi.removeOnRemove(this.vm, this.onRemove)

    await this.sm.stop()
  }
}
