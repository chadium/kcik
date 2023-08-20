import { Machine, MachineState } from '../../state-machine.mjs'

export class MouseVolumeControlState extends MachineState {
  videoPlayerElement = null

  onWheel = (e) => {
    e.preventDefault()

    let volume = this.player.volume()

    if (this.player.muted()) {
      volume = 0
    }

    if (e.wheelDelta > 0) {
      this.player.muted(false)
    }

    let newVolume = volume + e.wheelDelta / 1000

    this.player.volume(Math.min(1, Math.max(0, newVolume)))
  }

  onMousedown = (e) => {
    if (e.button === 1) {
      // Stop entering scroll mode.
      e.preventDefault()
    }
  }

  onAuxclick = (e) => {
    if (e.which === 2) {
      if (this.player.muted()) {
        this.player.muted(false)
        this.player.volume(1)
      } else {
        if (this.player.volume() === 0) {
          this.player.muted(false)
          this.player.volume(1)
        } else {
          this.player.muted(true)
          this.player.volume(0)
        }
      }
    }
  }

  constructor(videoPlayerElement) {
    super()
    this.videoPlayerElement = videoPlayerElement
    this.player = this.videoPlayerElement.player
  }

  async [MachineState.ON_ENTER]() {
    this.videoPlayerElement.addEventListener('wheel', this.onWheel, { passive: false })
    this.videoPlayerElement.addEventListener("mousedown", this.onMousedown)
    this.videoPlayerElement.addEventListener('auxclick', this.onAuxclick)
  }

  async [MachineState.ON_LEAVE]() {
    this.videoPlayerElement.removeEventListener('wheel', this.onWheel)
    this.videoPlayerElement.removeEventListener("mousedown", this.onMousedown)
    this.videoPlayerElement.removeEventListener('auxclick', this.onAuxclick)
  }
}
