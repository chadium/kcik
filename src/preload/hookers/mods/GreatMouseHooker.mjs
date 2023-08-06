import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as domUtils from '../../dom-utils.mjs'

export class GreatMouseHooker extends Hooker {
  async hook() {
    window.addEventListener('wheel', (e) => {
      if (e.target.classList.contains('vjs-volume-control')
        || e.target.classList.contains('vjs-volume-bar')
        || e.target.classList.contains('vjs-volume-level')
        || e.target.classList.contains('vjs-mouse-display')) {
        const container = this.getContainer(e.target)

        if (container !== null) {
          const videoElement = this.getVideoElement(container)

          if (videoElement !== null) {
            let newVolume = videoElement.volume + e.wheelDelta / 1000

            videoElement.volume = Math.min(1, Math.max(0, newVolume))

            e.preventDefault()

            const volumeLevel = this.getVolumeLevelElement(container)

            if (volumeLevel !== null) {
              volumeLevel.style.height = (videoElement.volume * 100) + '%'
            }
          }
        }
      }
    }, { passive: false })
  }

  async unhook() {
  }

  getContainer(elementWithin) {
    return domUtils.findParent(elementWithin, (element) => element.classList.contains('video-js'))
  }

  getVolumeLevelElement(container) {
    return container.querySelector('.vjs-volume-level')
  }

  getVideoElement(container) {
    return container.querySelector('video')
  }
}
