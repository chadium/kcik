import { MAX_32BIT_INT } from './math-utils.mjs'

export function waitForElm(id, {
  rootElement = document.body,
  timeout = MAX_32BIT_INT
} = {}) {
  return new Promise((resolve, reject) => {
    let element = document.getElementById(id)

    if (element) {
      return resolve(element)
    }

    const observer = new MutationObserver(mutations => {
      let element = document.getElementById(id)

      if (element) {
        clearTimeout(timeoutId)
        resolve(element)
        observer.disconnect()
      }
    })

    let timeoutId = setTimeout(() => {
      reject(new Error('Timeout'))
      observer.disconnect()
    }, timeout)

    observer.observe(rootElement, {
      childList: true,
      subtree: false
    })
  });
}

export function lookForElement(elem, fn) {
  if (fn(elem)) {
    return elem
  } else {
    for (let child of elem.children) {
      let result = lookForElement(child, fn)

      if (result !== null) {
        return result
      }
    }

    return null
  }
}

export function findParent(elem, predicate) {
  let current = elem.parentElement

  while (current) {
    if (predicate(current)) {
      return current
    }

    current = current.parentElement
  }

  return null
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
