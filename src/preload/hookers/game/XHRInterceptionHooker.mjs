import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class XHRInterceptionHooker extends Hooker {
  #requestInterceptors = new Set()

  #responseInterceptors = new Set()

  #originalOpen = null

  #originalSend = null

  async hook() {
    const self = this

    this.#originalOpen = XMLHttpRequest.prototype.open
    this.#originalSend = XMLHttpRequest.prototype.send
  
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      // We need to keep track of this information otherwise it becomes inaccessible.
      this.kcikMethod = method
      this.kcikUrl = url

      return self.#originalOpen.call(this, method, url, async, user, password)
    }
  
    XMLHttpRequest.prototype.send = function (body) {
      try {
        for (let interceptor of self.#requestInterceptors.values()) {
          interceptor({
            method: this.kcikMethod,
            url: this.kcikUrl,
            body,
            // TODO: Add other fields as they're needed.
          })
        }

        this.addEventListener('readystatechange', () => {
          if (this.readyState === XMLHttpRequest.DONE) {
            try {
              for (let interceptor of self.#responseInterceptors.values()) {
                interceptor({
                  method: this.kcikMethod,
                  url: this.kcikUrl,
                  responseText: () => {
                    return this.responseText;
                  },
                  responseJson: () => {
                    try {
                      return JSON.parse(this.responseText);
                    } catch (e) {
                      log.warn('XHRInterception', e)
                      return null
                    }
                  },
                  replaceResponseJson: (data) => {
                    const text = JSON.stringify(data)
                    Object.defineProperty(this, 'responseText', {
                      get: () => text
                    })
                  },
                })
              }
            } catch (e) {
              log.bad('XHRInterception', e)
            }
          }
        })
      } catch (e) {
        log.bad('XHRInterception', e)
      }

      return self.#originalSend.call(this, body)
    }

    return {
      name: 'xhrInterception',
      api: {
        installRequestInterceptor: (f) => {
          this.#requestInterceptors.add(f)

          return {
            uninstall: () => {
              this.#requestInterceptors.remove(f)
            }
          }
        },

        installResponseInterceptor: (f) => {
          this.#responseInterceptors.add(f)

          return {
            uninstall: () => {
              this.#responseInterceptors.remove(f)
            }
          }
        },
      }
    }
  }

  async unhook() {
    XMLHttpRequest.prototype.open = this.#originalOpen
    this.#originalOpen = null

    XMLHttpRequest.prototype.send = this.#originalSend
    this.#originalSend = null

    this.#requestInterceptors.clear()

    this.#responseInterceptors.clear()
  }
}
