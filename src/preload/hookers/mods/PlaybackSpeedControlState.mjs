import { Machine, MachineState } from '../../state-machine.mjs'

export class PlaybackSpeedControlState extends MachineState {
  videoPlayerElement = null

  constructor(videoPlayerElement) {
    super()
    this.videoPlayerElement = videoPlayerElement
    this.player = this.videoPlayerElement.player
  }

  async [MachineState.ON_ENTER]() {
    this.player.getChild('')

    this.player.playbackRates([0.25, 0.5, 1, 1.5, 2])
  }

  async [MachineState.ON_LEAVE]() {
    this.player.playbackRates([])
  }
}
