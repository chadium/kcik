import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { lookForElement } from '../../dom-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { VideoKeyboardNavigationState } from './VideoKeyboardNavigationState.mjs'

const CLIP_VIEWER_COMPONENT_NAME = 'ClipViewerVideo'

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
    await this.sm.start(new WaitingForClipMountState())
  }

  async [MachineState.ON_LEAVE]() {
    log.info('Clips', 'Disable vod keyboard navigation.')

    await this.sm.stop()
  }
}

class WaitingForClipMountState extends MachineState {
  constructor() {
    super()

    this.onMounted = (vm) => {
      log.info('Clips', 'A clip viewer component has been mounted.')
      this.machine.next(new WaitingForClipToCloseState(vm))
    }

    this.onNewComponent = ({ id }) => {
      let vueComponentApi = this.machine.pimp.getApi('vueComponent')

      let name = vueComponentApi.getComponentName(id)

      if (name === CLIP_VIEWER_COMPONENT_NAME) {
        log.info('Clips', 'Clip viewer component has been loaded.')
        vueComponentApi.addMounted(id, this.onMounted)
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('Clips', 'Looking for clip viewer.')

    let vueComponentApi = this.machine.pimp.getApi('vueComponent')

    let videoComponentId = vueComponentApi.getComponentIdByName(CLIP_VIEWER_COMPONENT_NAME)

    if (videoComponentId) {
      log.info('Clips', 'Component is loaded.')
      let nodes = vueComponentApi.findNodesByComponent(videoComponentId)

      if (nodes.length > 0) {
        log.info('Clips', 'Found clip viewer.')
        this.machine.next(new WaitingForClipToCloseState(vueComponentApi.getNodeComponentProxy(nodes[0])))
      } else {
        log.info('Clips', 'No clip viewers in the page. Will wait for one.')
        vueComponentApi.addMounted(videoComponentId, this.onMounted)
      }
    } else {
      log.info('Clips', 'Component not loaded. Must wait')
      vueComponentApi.on('newComponent', this.onNewComponent)
    }
  }

  async [MachineState.ON_LEAVE]() {
    log.info('Clips', 'No longer waiting for clip viewer.')

    let vueComponentApi = this.machine.pimp.getApi('vueComponent')

    let videoComponentId = vueComponentApi.getComponentIdByName(CLIP_VIEWER_COMPONENT_NAME)

    vueComponentApi.removeMounted(videoComponentId, this.onMounted)
  }
}

class WaitingForClipToCloseState extends MachineState {
  constructor(vm) {
    super()
    this.sm = null
    this.vm = vm
    this.onRemove = () => {
      this.machine.next(new WaitingForClipMountState())
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('Clips', 'Watching a clip.')

    let vueComponentApi = this.machine.pimp.getApi('vueComponent')
    vueComponentApi.addOnRemove(this.vm, this.onRemove)

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(new VideoKeyboardNavigationState(this.vm.$el))
  }

  async [MachineState.ON_LEAVE]() {
    let vueComponentApi = this.machine.pimp.getApi('vueComponent')
    vueComponentApi.removeOnRemove(this.vm, this.onRemove)

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

    const chromeExtensionApi = this.pimp.getApi('chromeExtension')

    chromeExtensionApi.send('kcik.ask', {
      fields: ['enableVodKeyboardNavigation']
    })

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

