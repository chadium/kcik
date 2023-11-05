import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class HideStreamersFeaturedHooker extends Hooker {
  constructor() {
    super()
    this._naughtyList = new Set()
  }

  async hook() {
    const piniaApi = this.pimp.getApi('pinia')

    piniaApi.on('available', () => {
      this.#hookIntoState()
    })

    return {
      name: 'hideStreamersFeatured',
      api: {
        setNaughtyList: (list) => {
          if (list.featured) {
            this._naughtyList = new Set(list.featured.map(naughty => naughty.toLowerCase()))
          }

          piniaApi.once('available', () => this.#doesTheDeed())
        }
      }
    }
  }

  unhook() {
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

      if (this._naughtyList.has(user)) {
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
