import { Machine, MachineState } from '../../state-machine.mjs'

export class VideoKeyboardNavigationState extends MachineState {
  video = null

  keyActions = {
    ArrowLeft: (e) => {
      let power = e.shiftKey ? 10000 : 5000
      this.skipTime(-power)
    },
    ArrowRight: (e) => {
      let power = e.shiftKey ? 10000 : 5000
      this.skipTime(power)
    },
    " ": (e) => {
      if (this.video.paused) {
        this.video.play()
      } else {
        this.video.pause()
      }
    },
    ",": (e) => {
      // Can't do this because it's not working. I cannot
      // detect the frame rate.
      return
      this.skipFrames(-1)
    },
    ".": (e) => {
      return
      // Can't do this because it's not working. I cannot
      // detect the frame rate.
      this.skipFrames(1)
    }
  }

  onKeydown = (e) => {
    if (e.key in this.keyActions) {
      this.keyActions[e.key](e)
      e.preventDefault()
    }
  }

  constructor(video) {
    super()
    this.video = video
  }

  async [MachineState.ON_ENTER]() {
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