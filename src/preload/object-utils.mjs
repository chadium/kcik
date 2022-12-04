import { MAX_32BIT_INT } from './math-utils.mjs'

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

export function findValue(obj, value) {
  let seen = new Set()
  let found = []

  function findNested(obj, key, value, previousPath) {
    // Base case
    let currentPath = previousPath.concat()
    currentPath.push(key)

    if (obj[key] === value) {
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
        findNested(newObj, newKey, value, currentPath)
      }
    } else {
      // Ignore.
    }
  }

  for (let key of Object.keys(obj)) {
    findNested(obj, key, value, [])
  }

  return found
}

export function debugAccess(o, propName) {
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
}
