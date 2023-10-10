import { MAX_32BIT_INT } from './math-utils.mjs'

class Waiting {
  #resolve = null

  constructor() {
    this.promise = new Promise((resolve) => this.#resolve = resolve) 
  }

  set(value) {
    this.#resolve(value)
  }
}

function incorporate(m) {
  if (m.set.promises) {
    // Already been here.
    return 
  }

  const internalState = {
    waiting: {}
  }

  const originalSet = m.set

  m.set = (key, value) => {
    if (internalState.waiting[key]) {
      internalState.waiting[key].set(value)
      delete internalState.waiting[key]
    }

    return originalSet.call(m, key, value)
  }

  m.set.internalState = internalState
}

export async function waitForSet(m, key, {
  timeout = MAX_32BIT_INT,
} = {}) {
  incorporate(m)

  if (m.set.internalState.waiting[key]) {
    // Reuse.
    return m.set.internalState.waiting[key].promise
  }

  m.set.internalState.waiting[key] = new Waiting()

  return m.set.internalState.waiting[key].promise
}
