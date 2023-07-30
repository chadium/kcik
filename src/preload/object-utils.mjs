import objectPath from 'object-path'
import { MAX_32BIT_INT } from './math-utils.mjs'

export function getByPath(o, path) {
  return objectPath.get(o, path)
}

export function hijackProperty(o, propName, {
  get = () => {},
  set = () => {}
} = {}) {
  Object.defineProperty(o, propName, {
    configurable: true,
    set,
    get
  })

  return {
    close() {
      let value = o[propName]
      delete o[propName]
      o[propName] = value
    }
  }
}

export function hijackPropertyWithMemory(o, propName, {
  get,
  set
} = {}) {
  let storage = o[propName]

  let propSet = (() => {
    if (set) {
      return (v) => {
        storage = v
        set(v)
      }
    } else {
      return (v) => {
        storage = v
      }
    }
  })()

  let propGet = (() => {
    if (get) {
      return () => get()
    } else {
      return () => {}
    }
  })()

  Object.defineProperty(o, propName, {
    configurable: true,
    set: propSet,
    get: propGet
  })

  return {
    close() {
      delete o[propName]
      o[propName] = storage
    }
  }
}

export async function waitForProperty(o, propName, {
  timeout = MAX_32BIT_INT,
  nullable = true,
  accept
} = {}) {
  function alreadyExists() {
    if (!(propName in o)) {
      return false
    }

    if (!nullable) {
      if (o[propName] === null) {
        return false
      }
    }

    if (accept && !accept(o[propName])) {
      return false
    }
    
    return true
  }

  if (alreadyExists()) {
    return o[propName]
  }

  return new Promise((resolve, reject) => {
    let storage = o[propName]

    let timeoutId = setTimeout(() => {
      reject(new Error('Timeout'))
      // TODO: Do we remove property?
    }, timeout)

    Object.defineProperty(o, propName, {
      configurable: true,
      set(v) {
        storage = v

        if (!nullable) {
          if (storage === null || storage === undefined) {
            // Nope.
            return
          }
        }

        if (accept && !accept(o[propName])) {
          // Nope.
          return
        }

        clearTimeout(timeoutId)
        resolve(storage)

        delete o[propName]
        o[propName] = storage
      },
      get() {
        return storage
      }
    })
  })
}

export function onPropertyChange(o, propName, onChange) {
  let storage = o[propName]

  Object.defineProperty(o, propName, {
    configurable: true,
    set(v) {
      storage = v

      onChange(v)
    },
    get() {
      return storage
    }
  })

  return {
    close() {
      delete o[propName]
      o[propName] = storage
    }
  }
}

export function allKeys() {
  throw new Error('To be implemented.')
}

export function allKeyValues(obj) {
  let result = []

  if (obj instanceof Map) {
    for (let key of obj.keys()) {
      let value = obj.get(key)

      result.push([key, value])
    }
  } else if (obj === undefined || obj === null) {
    // Do nothing.
  } else {
    for (let key in obj) {
      try {
        let value = obj[key]
        result.push([key, value])
      } catch (e) {
        if (e instanceof DOMException) {
          // Ignore.
        } else {
          throw e
        }
      }
    }

    for (let symbol of Object.getOwnPropertySymbols(obj)) {
      let value = obj[symbol]
      result.push([symbol, value])
    }
  }

  return result
}

export function pathsToValue(obj, needle) {
  let seen = new Set()
  let found = []

  function findNested(key, value, previousPath) {
    // Base case
    let currentPath = previousPath.concat()
    currentPath.push(key)

    if (value === needle) {
      found.push(currentPath)
    } else if (value === null) {
      // Ignore.
    } else if (typeof value === 'object') {
      if (seen.has(value)) {
        // Skip to prevent stack overflow.
        return
      }

      seen.add(value)

      for (let [newKey, newValue] of allKeyValues(value)) {
        findNested(newKey, newValue, currentPath)
      }
    } else {
      // Ignore.
    }
  }

  for (let [key, value] of allKeyValues(obj)) {
    findNested(key, value, [])
  }

  return found
}

export function pathsToKey(obj, needle) {
  let seen = new Set()
  let found = []

  function findNested(obj, key, needle, previousPath) {
    // Base case
    let currentPath = previousPath.concat()
    currentPath.push(key)

    if (key === needle) {
      found.push(currentPath)
    } else if (obj[key] === null) {
      // Ignore.
    } else if (typeof obj[key] === 'object') {
      if (seen.has(obj[key])) {
        // Skip to prevent stack overflow.
        return
      }

      seen.add(obj[key])

      let newObj = obj[key]
      for (let newKey of Object.keys(newObj)) {
        findNested(newObj, newKey, needle, currentPath)
      }
    } else {
      // Ignore.
    }
  }

  for (let key of Object.keys(obj)) {
    findNested(obj, key, needle, [])
  }

  return found
}

export function pathsToPredicate(obj, {
  predicate,
  maxLevel = Infinity
}) {
  let seen = new Set()
  let found = []

  function findNested(obj, level, previousPath) {
    if (typeof obj === 'object') {
      if (seen.has(obj)) {
        // Skip to prevent stack overflow.
        return
      }

      seen.add(obj)
    }

    if (predicate(obj, previousPath)) {
      found.push(previousPath.concat())
    }

    if (level === maxLevel) {
      // Nope.
      return
    }

    if (typeof obj === 'object') {
      for (let k in obj) {
        let currentPath = previousPath.concat()
        currentPath.push(k)

        findNested(obj[k], level + 1, currentPath)
      }
    }
  }

  findNested(obj, 0, [])

  return found
}

export function findFirstValueByPredicate(obj, {
  predicate,
  maxLevel = Infinity
}) {
  let seen = new Set()
  let found = undefined

  function findNested(obj, level) {
    if (obj === null) {
      // TODO: This shouldn't be ignored.
    } else if (typeof obj === 'object') {
      if (seen.has(obj)) {
        // Skip to prevent stack overflow.
        return
      }

      seen.add(obj)

      if (predicate(obj)) {
        found = obj
        return
      }

      if (level === maxLevel) {
        // Nope.
        return
      }

      for (let k in obj) {
        findNested(obj[k], level + 1)

        if (found !== undefined) {
          break
        }
      }
    } else {
      // Ignore.
    }
  }

  findNested(obj, 0)

  return found
}

export function breakOnSet(o, propName) {
  let storage = o[propName]

  Object.defineProperty(o, propName, {
    configurable: true,
    set(v) {
      storage = v
      debugger
    },
    get() {
      return storage
    }
  })

  return {
    close() {
      delete o[propName]
      o[propName] = storage
    }
  }
}

export function breakOnGet(o, propName) {
  let storage = o[propName]

  Object.defineProperty(o, propName, {
    configurable: true,
    set(v) {
      storage = v
    },
    get() {
      debugger
      return storage
    }
  })

  return {
    close() {
      delete o[propName]
      o[propName] = storage
    }
  }
}

export function freezeProperty(o, propName) {
  let storage = o[propName]

  Object.defineProperty(o, propName, {
    configurable: true,
    set(v) {
      // Ignore.
    },
    get() {
      return storage
    }
  })

  return {
    close() {
      delete o[propName]
      o[propName] = storage
    }
  }
}

export function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}
