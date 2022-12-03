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
