
export class WatchTracker {
  #memory = {}

  load(memory) {
    this.#memory = memory
  }

  save() {
    return this.#memory
  }

  track(id, timestamp, currentDate) {
    const firstMillisecond = new Date(currentDate)
    firstMillisecond.setUTCMilliseconds(0)
    firstMillisecond.setUTCSeconds(0)
    firstMillisecond.setUTCMinutes(0)
    firstMillisecond.setUTCHours(0)

    let today = this.#memory[firstMillisecond.getTime()]

    if (today === undefined) {
      today = this.#memory[firstMillisecond.getTime()] = {}
    }

    today[id] = timestamp
  }

  remember(id) {
    const days = Object.keys(this.#memory)
      .map(Number)
      .sort((a, b) => b - a)

    for (let day of days) {
      if (this.#memory[day][id]) {
        return this.#memory[day][id]
      }
    }

    return null
  }

  clean(minDate) {
    const days = Object.keys(this.#memory)
      .map(Number)

    for (let day of days) {
      if (day < minDate.getTime()) {
        delete this.#memory[day]
      }
    }
  }
}