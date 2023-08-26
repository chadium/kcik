import { Machine, MachineState } from '../../state-machine.mjs'

export class VideoCurrentTimeFixState extends MachineState {
  videoPlayerElement = null
  originalClassName = null

  constructor(videoPlayerElement) {
    super()
    this.videoPlayerElement = videoPlayerElement
    this.player = this.videoPlayerElement.player
  }

  async [MachineState.ON_ENTER]() {
    this.player.controlBar.currentTimeDisplay.el().style.display = 'block'
    this.player.controlBar.currentTimeDisplay.el().style.fontSize = '13px'

    this.originalClassName = this.player.controlBar.remainingTimeDisplay.el().className
    this.player.controlBar.remainingTimeDisplay.el().className = ''
    this.player.controlBar.remainingTimeDisplay.hide()
  }

  async [MachineState.ON_LEAVE]() {
    if (!this.player.isDisposed()) {
      this.player.controlBar.remainingTimeDisplay.el().className = this.originalClassName
      this.player.controlBar.remainingTimeDisplay.show()
  
      this.player.controlBar.currentTimeDisplay.el().style.display = ''
    }
  }
}
