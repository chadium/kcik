import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'

function isStreamerChannel(channel) {
  return channel.startsWith('channel.')
}

export class EchoHooker extends Hooker {
  #events = null
  #originalSubscribe = null
  #originalUnsubscribe = null

  constructor() {
    super()
  }

  async hook() {
    this.#events = new EventEmitter()

    this.#originalSubscribe = Echo.connector.pusher.subscribe
    this.#originalUnsubscribe = Echo.connector.pusher.unsubscribe

    Echo.connector.pusher.subscribe = (channel) => {
      let result = this.#originalSubscribe.call(Echo.connector.pusher, channel)

      this.#events.emit('subscribe', {
        channel
      })

      if (isStreamerChannel(channel)) {
        this.#events.emit('streamerSubscribe', {
          streamerId: channel.substring(channel.indexOf('.') + 1),
          channel
        })
      }

      return result
    }

    Echo.connector.pusher.unsubscribe = (channel) => {
      this.#events.emit('unsubscribe', {
        channel
      })

      if (isStreamerChannel(channel)) {
        this.#events.emit('streamerUnsubscribe', {
          streamerId: channel.substring(channel.indexOf('.') + 1),
          channel
        })
      }

      return this.#originalUnsubscribe.call(Echo.connector.pusher, channel)
    }

    return {
      name: 'echo',
      api: {
        on: (type, cb) => this.#events.on(type, cb),
        off: (type, cb) => this.#events.off(type, cb),
        getStreamerChannels() {
          let results = []

          for (let channel of Echo.connector.pusher.channels.all()) {
            if (isStreamerChannel(channel.name)) {
              results.push(channel)
            }
          }

          return results
        },
        getChannel: (channel) => {
          return Echo.connector.pusher.channels.find(channel) ?? null
        },
        getChannelEventHandlers: (channel, type) => {
          if (typeof channel === 'string') {
            channel = Echo.connector.pusher.channels.find(channel)

            if (channel === undefined) {
              throw new Error('Could not find channel')
            }
          }

          return channel.callbacks.get(type) ?? null
        },
        removeChannelEventHandler: (channel, type, eventHandler) => {
          if (typeof channel === 'string') {
            channel = Echo.connector.pusher.channels.find(channel)

            if (channel === undefined) {
              throw new Error('Could not find channel')
            }
          }

          channel.callbacks.removeCallback([`_${type}`], eventHandler.fn, eventHandler.context)
        }
      }
    }
  }

  async unhook() {
  }
}
