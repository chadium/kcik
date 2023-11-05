import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class HideStreamersRecommendedHooker extends Hooker {
  constructor() {
    super()
    this.interceptor = null
    this._naughtyList = new Set()
  }

  async hook() {
    const vueQueryApi = this.pimp.getApi('vueQuery')

    this.interceptor = vueQueryApi.intercept(({ query }) => {
      if (query.queryHash === "[\"recommendedChannels\"]") {
        this.#sanitize(query.state.data)
      }
    })

    return {
      name: 'hideStreamersRecommended',
      api: {
        setNaughtyList: (list) => {
          if (list.featured) {
            this._naughtyList = new Set(list.featured.map(naughty => naughty.toLowerCase()))
          }

          vueQueryApi.once('available', () => {
            let data = vueQueryApi.getQueryData(["recommendedChannels"])

            if (data === undefined) {
              // Do nothing. Website has not fetched data yet.
              return
            }

            data = data.concat()

            this.#sanitize(data)

            vueQueryApi.setQueryData(["recommendedChannels"], data)
          })
        }
      }
    }
  }

  unhook() {
    this.interceptor.stop()
    this.interceptor = null
  }

  #sanitize(data) {
    for (let i = data.length - 1; i >= 0; i--) {
      let user = data[i].user_username.toLowerCase()

      if (this._naughtyList.has(user)) {
        data.splice(i, 1)
      }
    }
  }
}
