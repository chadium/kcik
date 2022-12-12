import * as arrayUtils from './array-utils.mjs'

export function onceMutation(store, mutationName, cb) {
  function on() {
    try {
      cb(...arguments)
    } finally {
      close()
    }
  }

  function close() {
    let mutations = store._mutations[mutationName]
    arrayUtils.removeFirstByValue(mutations, on)
  }

  store._mutations[mutationName].push(on)

  return {
    close
  }
}
