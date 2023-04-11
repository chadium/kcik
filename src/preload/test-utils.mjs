export function createTrackingFunction(fetch = () => {}) {
  let f = async (...args) => {
    f.tracker.push(args)
    return await fetch(...args)
  }

  f.tracker = []

  return f
}

export function createTrackingFunctionSync(fetch = () => {}) {
  let f = (...args) => {
    f.tracker.push(args)
    return fetch(...args)
  }

  f.tracker = []

  return f
}
