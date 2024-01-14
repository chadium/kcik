import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class HideStreamersCategoryHooker extends Hooker {
  #naughtyList = new Set()

  #interceptor = null

  async hook() {
    const xhrInterceptionApi = this.pimp.getApi('xhrInterception')

    this.#interceptor = xhrInterceptionApi.installResponseInterceptor((e) => {
      if (e.url.startsWith('https://kick.com/stream/livestreams/')) {
        const data = e.responseJson()

        data.data = data.data.filter(entry => {
          return !this.#naughtyList.has(entry.channel.user.username.toLowerCase())
        })

        e.replaceResponseJson(data)
      }
    })

    return {
      name: 'hideStreamersCategory',
      api: {
        setNaughtyList: (list) => {
          this.#naughtyList = new Set(list.category.map(naughty => naughty.toLowerCase()))
        }
      }
    }
  }

  unhook() {
    this.#interceptor.uninstall()
    this.#interceptor = null
  }
}
