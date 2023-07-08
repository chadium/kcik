import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { lookForElement } from '../../dom-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'
import { VideoKeyboardNavigationState } from './VideoKeyboardNavigationState.mjs'

class DisabledState extends MachineState {}

class EnabledState extends MachineState {
  constructor() {
    super()
    this.sm = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('Vod', 'Enable vod keyboard navigation.')

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(new UnknownState())
  }

  async [MachineState.ON_LEAVE]() {
    log.info('Vod', 'Disable vod keyboard navigation.')

    await this.sm.stop()
  }
}

class UnknownState extends MachineState {
  async [MachineState.ON_ENTER]() {
    let vueRouteApi = this.machine.pimp.getApi('vueRoute')

    if (vueRouteApi.getRouteName() === 'video') {
      this.machine.next(new VideoPageState())
    } else {
      this.machine.next(new WaitingForVideoPageState())
    }
  }
}

class WaitingForVideoPageState extends MachineState {
  constructor() {
    super()
    this.onNavigate = ({ name }) => {
      if (name === 'video') {
        log.info('Vod', 'Entered video page.')
        this.machine.next(new VideoPageState())
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('Vod', 'Waiting for video page.')

    let vueRouteApi = this.machine.pimp.getApi('vueRoute')

    vueRouteApi.on('navigate', this.onNavigate)
  }

  async [MachineState.ON_LEAVE]() {
    let vueRouteApi = this.machine.pimp.getApi('vueRoute')

    vueRouteApi.off('navigate', this.onNavigate)
  }
}

class VideoPageState extends MachineState {
  constructor() {
    super()
    this.sm = null
    this.onNavigate = ({ name }) => {
      if (name !== 'video') {
        log.info('Vod', 'Leaving video page.')
        this.machine.next(new WaitingForVideoPageState())
      }
    }
  }

  async [MachineState.ON_ENTER]() {
    log.info('Vod', 'In the video page.')

    let vueRouteApi = this.machine.pimp.getApi('vueRoute')

    vueRouteApi.on('navigate', this.onNavigate)

    this.sm = new Machine()
    this.sm.pimp = this.machine.pimp
    await this.sm.start(new VideoPageLookForElementState())
  }

  async [MachineState.ON_LEAVE]() {
    await this.sm.stop()

    let vueRouteApi = this.machine.pimp.getApi('vueRoute')

    vueRouteApi.off('navigate', this.onNavigate)
  }
}

class VideoPageLookForElementState extends MachineState {
  constructor() {
    super()
  }

  async [MachineState.ON_ENTER]() {
    log.info('Vod', 'Waiting for video element')

    let videoHolder = document.getElementById('video-holder')

    if (videoHolder !== null) {
      log.info('Vod', 'Video holder found')
      let video = videoHolder.getElementsByTagName('video')[0]
      this.machine.next(new VideoKeyboardNavigationState(video))
    } else {
      log.info('Vod', 'Video holder is missing')
      this.machine.next(new VideoPageWaitForElementState())
    }
  }
}

class VideoPageWaitForElementState extends MachineState {
  constructor() {
    super()

    this.observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              let videoHolder = lookForElement(addedNode, (el) => el.id === 'video-holder')

              if (videoHolder) {
                log.info('Vod', 'Video holder found by mutation observer')
                let video = videoHolder.getElementsByTagName('video')[0]
                this.machine.next(new VideoKeyboardNavigationState(video))
              }
            }
          }
        }
      }
    })
  }

  async [MachineState.ON_ENTER]() {
    let mainView = document.getElementById('main-view')

    this.observer.observe(mainView, {
      childList: true,
      subtree: true
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.observer.disconnect()
  }
}

export class VodHooker extends Hooker {
  #sm = null
  #state = false

  async hook() {
    this.#sm = new Machine()
    this.#sm.pimp = this.pimp
    await this.#sm.start(new DisabledState())

    return {
      name: 'vod',
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

