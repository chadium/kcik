import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as objectUtils from '../../object-utils.mjs'
import * as log from '../../log.mjs'

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
    this.#events = new EventEmitter();

    (async () => {
      try {
        await objectUtils.waitForProperty(window, 'Echo')

        log.info('Echo', 'Found Echo object.')

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

        this.#events.emit('available')

        this.#events.on('newListener', (name, listener) => {
          if (name === 'available') {
            // Already available. Call it.
            listener()
          }
        })
      } catch (e) {
        log.bad('Echo', e)
      }
    })()

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

          return channel.callbacks.get(type) ?? []
        },
        addChannelEventHandler: (channel, type, eventHandler) => {
          if (typeof channel === 'string') {
            channel = Echo.connector.pusher.channels.find(channel)

            if (channel === undefined) {
              throw new Error('Could not find channel')
            }
          }

          channel.callbacks.add(type, eventHandler.fn, eventHandler.context)
        },
        removeChannelEventHandler: (channel, type, eventHandler) => {
          if (typeof channel === 'string') {
            channel = Echo.connector.pusher.channels.find(channel)

            if (channel === undefined) {
              throw new Error('Could not find channel')
            }
          }

          channel.callbacks.removeCallback([`_${type}`], eventHandler.fn, eventHandler.context)
        },
        setChannelEventHandlerFilter: (channel, filterCallback) => {
          if (typeof channel === 'string') {
            channel = Echo.connector.pusher.channels.find(channel)

            if (channel === undefined) {
              throw new Error('Could not find channel')
            }
          }

          if (Object.hasOwnProperty(channel, 'bind')) {
            throw new Error('Filter already set up. Please remove it first.')
          }

          const originalOn = channel.bind;

          channel.bind = (type, fn, context) => {
            if (filterCallback(type, { fn, context })) {
              originalOn.call(channel, type, fn, context)
            }
          }
        },
        removeChannelEventHandlerFilter: (channel) => {
          delete channel.bind
        }
      }
    }
  }

  async unhook() {
  }
}
