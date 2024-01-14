import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as objectUtils from '../../object-utils.mjs'

const KEY = 'VUE_QUERY_CLIENT'

export class VueQueryHooker extends Hooker {
  #events = new EventEmitter()
  #client = null
  #interceptors = new Set()

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', async (vueApp) => {
      try {
        await objectUtils.waitForProperty(vueApp._context, 'provides')
        await objectUtils.waitForProperty(vueApp._context.provides, KEY)
  
        this.#client = vueApp._context.provides[KEY]

        this.#client.queryCache.subscribe(({ query, type }) => {
          if (type === 'added') {
            this.#addObserver(query)
          }
        })

        for (let query of this.#client.queryCache.queries) {
          this.#addObserver(query)
        }

        this.#events.emit('available')

        this.#events.on('newListener', (name, listener) => {
          if (name === 'available') {
            // Already available. Call it.
            listener()
          }
        })
        log.info('VueQuery', 'Found client.')
      } catch (e) {
        log.bad('VueQuery', e)
      }
    })

    return {
      name: 'vueQuery',
      api: {
        intercept: (fn) => {
          if (this.#interceptors.has(fn)) {
            throw new Error('Already intercepting.')
          }

          this.#interceptors.add(fn)

          return {
            stop: () => {
              this.#interceptors.delete(fn)
            }
          }
        },

        allKeys: () => {
          return this.#client.queryCache.queriesMap.keys()
        },

        getQueryData: (queryKey) => {
          const query = this.#client.queryCache.queriesMap[JSON.stringify(queryKey)]

          if (query === undefined) {
            return undefined
          }

          return query.state.data
        },

        setQueryData: (queryKey, data) => {
          const query = this.#client.queryCache.queriesMap[JSON.stringify(queryKey)]

          if (query === undefined) {
            // Do nothing.
            return
          }

          query.setData(data)
        },

        on: this.#events.on.bind(this.#events),
        once: this.#events.once.bind(this.#events),
        off: this.#events.off.bind(this.#events),
      }
    }
  }

  async unhook() {
  }

  #addObserver(query) {
    query.observers.unshift({
      onQueryUpdate: ({ type }) => {
        if (type === 'success') {
          for (const interceptor of this.#interceptors) {
            try {
              interceptor({ query })
            } catch (e) {
              log.bad('VueQuery', e)
            }
          }
        }
      },
      shouldFetchOnWindowFocus: () => false
    })
  }
}
