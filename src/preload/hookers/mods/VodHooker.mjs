import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { lookForElement } from '../../dom-utils.mjs'

import { Machine, MachineState } from '../../state-machine.mjs'

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
      this.machine.next(new VideoPageGotElementState())
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
              if (lookForElement(addedNode, (el) => el.id === 'video-holder')) {
                log.info('Vod', 'Video holder found by mutation observer')
                this.machine.next(new VideoPageGotElementState())
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

class VideoPageGotElementState extends MachineState {
  video = null

  keyActions = {
    ArrowLeft: () => {
      let power = e.shiftKey ? 10000 : 5000
      this.skipTime(-power)
    },
    ArrowRight: () => {
      let power = e.shiftKey ? 10000 : 5000
      this.skipTime(power)
    },
    " ": () => {
      if (this.video.paused) {
        this.video.play()
      } else {
        this.video.pause()
      }
    },
    ",": () => {
      // Can't do this because it's not working. I cannot
      // detect the frame rate.
      return
      this.skipFrames(-1)
    },
    ".": () => {
      return
      // Can't do this because it's not working. I cannot
      // detect the frame rate.
      this.skipFrames(1)
    }
  }

  onKeydown = (e) => {
    if (e.key in this.keyActions) {
      this.keyActions[e.key]()
      e.preventDefault()
    }
  }

  async [MachineState.ON_ENTER]() {
    let videoHolder = document.getElementById('video-holder')

    this.video = videoHolder.getElementsByTagName('video')[0]

    document.addEventListener("keydown", this.onKeydown)
  }

  async [MachineState.ON_LEAVE]() {
    document.removeEventListener("keydown", this.onKeydown)
  }

  skipTime(millis) {
    this.video.currentTime += millis / 1000
  }

  skipFrames(frameCount) {
    let mediaInfo = this.video.getVideoPlaybackQuality()
    let currentFrame = this.seconds2Frames(this.video.currentTime, mediaInfo.framesPerSecond)
    this.video.currentTime = this.frames2Seconds(currentFrame + frameCount, mediaInfo.framesPerSecond)
  }

  seconds2Frames(time, framesPerSecond) {
    return Math.floor(time * framesPerSecond)
  }

  frames2Seconds(frames, framesPerSecond) {
    return frames / framesPerSecond
  }
}

export class VodHooker extends Hooker {
  #sm = null

  async hook() {
    this.#sm = new Machine()
    this.#sm.pimp = this.pimp
    await this.#sm.start(new DisabledState())

    const chromeExtensionApi = this.pimp.getApi('chromeExtension')

    chromeExtensionApi.send('kcik.ask', {
      fields: ['enableVodKeyboardNavigation']
    })

    return {
      name: 'vod',
      api: {
        enableVodKeyboardNavigation: (state) => {
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

