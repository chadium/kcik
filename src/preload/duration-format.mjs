export function hhmmss(duration) {
  if (!(duration >= 0)) {
    return '--:--:--'
  }

  const hours = Math.floor((duration / (1000 * 60 * 60)))
  const minutes = Math.floor((duration / 1000 / 60) % 60)
  const seconds = Math.floor((duration / 1000) % 60)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function mmss(duration) {
  if (!(duration >= 0)) {
    return '--:--'
  }

  const minutes = Math.floor((duration / 1000 / 60) % 60)
  const seconds = Math.floor((duration / 1000) % 60)

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function seconds(duration) {
  if (!(duration >= 0)) {
    return '--'
  }

  const seconds = Math.floor((duration / 1000) % 60)

  return `${seconds.toString().padStart(2, '0')}`
}
