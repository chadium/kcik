import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

export class WaitForVueComponentMountState extends MachineState {
  constructor(name, onMounted) {
    super()

    this.name = name

    this.onMounted = onMounted

    this.onNewComponent = ({ id }) => {
      let vueComponentApi = this.machine.pimp.getApi('vueComponent')

      let name = vueComponentApi.getComponentName(id)

      if (name === this.name) {
        log.info('WaitForVueComponentMountState', `Found ${this.name} component.`)
        vueComponentApi.addMounted(id, this.onMounted)
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('WaitForVueComponentMountState', `Looking for ${this.name} component.`)

    let vueComponentApi = this.machine.pimp.getApi('vueComponent')

    let videoComponentId = vueComponentApi.getComponentIdByName(this.name)

    if (videoComponentId) {
      log.info('WaitForVueComponentMountState', `Component ${this.name} is loaded.`)
      let nodes = vueComponentApi.findNodesByComponent(videoComponentId)

      if (nodes.length > 0) {
        log.info('WaitForVueComponentMountState', `Component ${this.name} had already been instantiated. Will call onMount manually.`)
        this.onMounted(vueComponentApi.getNodeComponentProxy(nodes[0]))
      } else {
        log.info('WaitForVueComponentMountState', `Registering onMounted for component ${this.name}.`)
        vueComponentApi.addMounted(videoComponentId, this.onMounted)
      }
    } else {
      log.info('WaitForVueComponentMountState', `Component ${this.name} not loaded. Must wait`)
      vueComponentApi.on('newComponent', this.onNewComponent)
    }
  }

  async [MachineState.ON_LEAVE]() {
    log.info('WaitForVueComponentMountState', 'No longer waiting for clip viewer.')

    let vueComponentApi = this.machine.pimp.getApi('vueComponent')

    let videoComponentId = vueComponentApi.getComponentIdByName(this.name)

    vueComponentApi.removeMounted(videoComponentId, this.onMounted)
    vueComponentApi.off('newComponent', this.onNewComponent)
  }
}