export function createTrackingFunction(fetch = () => {}) {
  let f = async (...args) => {
    f.tracker.push(args)
    return await fetch(...args)
  }

  f.tracker = []

  return f
}