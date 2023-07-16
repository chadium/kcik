import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class HideStreamersHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._naughtyList = {
      featured: new Set()
    }
  }

  async hook() {
    this.#workaroundWebsiteBug()
    this.#doesTheDeed()

    return {
      name: 'hideStreamers',
      api: {
        setNaughtyList: (list) => {
          this._naughtyList = list

          for (const key in this._naughtyList) {
            this._naughtyList[key] = new Set(this._naughtyList[key].map(naughty => naughty.toLowerCase()))
          }

          this.#doesTheDeed()
        }
      }
    }
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()
  }

  #doesTheDeed() {
    const piniaApi = this.pimp.getApi('pinia')

    let channelState = piniaApi.getModuleState('channel')

    for (let i = channelState.featuredLivestreams.length - 1; i >= 0; i--) {
      let user = channelState.featuredLivestreams[i].channel.user.username.toLowerCase()

      if (this._naughtyList.featured.has(user)) {
        channelState.featuredLivestreams.splice(i, 1)
      }
    }
  }

  #workaroundWebsiteBug() {
    const piniaApi = this.pimp.getApi('pinia')

    let channelState = piniaApi.getModuleState('channel')

    let data = channelState.featuredLivestreams

    Object.defineProperty(channelState, 'featuredLivestreams', {
      get() {
        return data
      },
      set: (newData) => {
        data.length = 0
        for (let entry of newData) {
          data.push(entry)
        }
        this.#doesTheDeed()
      }
    })
  }
}