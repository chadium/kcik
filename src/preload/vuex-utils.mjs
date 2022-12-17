import * as arrayUtils from './array-utils.mjs'

function makeItRemoveItselfWhenLast(arr) {
  return function fn() {
    let i = arr.length - 1

    if (i === -1) {
      // What? How?
      return
    }

    if (arr[i] === fn) {
      arr.splice(i, 1)
    }
  }
}

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
    let i = mutations.indexOf(on)

    if (i === -1) {
      // Where did it go!?
      return
    }

    // We can't remove the function if it isn't the last one in the list
    // because if we remove something in the middle of a for loop,
    // the for loop will skip a value.
    mutations[i] = makeItRemoveItselfWhenLast(mutations)
  }

  store._mutations[mutationName].push(on)

  return {
    close
  }
}

export function overrideMutation(store, mutationName, cb) {
  let originalMutations = store._mutations[mutationName]

  function close() {
    store._mutations[mutationName] = originalMutations
  }

  store._mutations[mutationName] = [cb]

  return {
    close
  }
}

export function onMutation(store, mutationName, cb) {
  function close() {
    let mutations = store._mutations[mutationName]
    let i = mutations.indexOf(cb)

    if (i === -1) {
      // Where did it go!?
      return
    }

    // We can't remove the function if it isn't the last one in the list
    // because if we remove something in the middle of a for loop,
    // the for loop will skip a value.
    mutations[i] = makeItRemoveItselfWhenLast(mutations)
  }

  store._mutations[mutationName].push(cb)

  return {
    close
  }
}
