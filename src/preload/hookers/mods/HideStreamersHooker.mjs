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
    const piniaApi = this.pimp.getApi('pinia')

    piniaApi.on('available', () => {
      this.#hookIntoState()
    })

    return {
      name: 'hideStreamers',
      api: {
        setNaughtyList: (list) => {
          this._naughtyList = list

          for (const key in this._naughtyList) {
            this._naughtyList[key] = new Set(this._naughtyList[key].map(naughty => naughty.toLowerCase()))
          }

          piniaApi.once('available', () => this.#doesTheDeed())
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

    if (!(channelState && channelState.featuredLivestreams)) {
      // Not present.
      log.warn('HideStreamers', 'featuredLivestreams state not found')
      return
    }

    for (let i = channelState.featuredLivestreams.length - 1; i >= 0; i--) {
      let user = channelState.featuredLivestreams[i].channel.user.username.toLowerCase()

      if (this._naughtyList.featured.has(user)) {
        channelState.featuredLivestreams.splice(i, 1)
      }
    }
  }

  #hookIntoState() {
    const piniaApi = this.pimp.getApi('pinia')

    let channelState = piniaApi.getModuleState('channel')

    if (!(channelState && channelState.featuredLivestreams)) {
      // Not present.
      log.warn('HideStreamers', 'featuredLivestreams state not found')
      return
    }

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
