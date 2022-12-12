import EventEmitter from 'events'
import { Hooker } from '../../Pimp.mjs'
import { pathsToKey, getByPath, findFirstValueByPredicate } from '../../object-utils.mjs'
import { onceMutation } from '../../vuex-utils.mjs'
import * as log from '../../log.mjs'

export class EntityComponentSystemHooker extends Hooker {
  constructor() {
    super()
    this._world = null
    this._events = new EventEmitter()
  }

  hook() {
    this._events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._world !== null) {
          // Already available. Call it.
          listener(this._world)
        }
      }
    })

    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let world = findFirstValueByPredicate(vueAppApi.getGameObject(), {
        predicate(o) {
          return 'unregisterSystem' in o
        },
        maxLevel: 3
      })
      if (world !== undefined) {
        log.info('EntityComponentSystem', 'Found ECSY world.')
        this._world = world
      } else {
        log.bad('EntityComponentSystem', 'Could not find ECSY world. Will hook into setWorld and wait for it.')
        this._setWorldMutationHooker = onceMutation(vueAppApi.getVueApp().$store, 'game/setWorld', (world) => {
          log.info('EntityComponentSystem', 'World was set world. Will search for ECSY world...')

          world = findFirstValueByPredicate(world, {
            predicate(o) {
              return 'unregisterSystem' in o
            },
            maxLevel: 1
          })
          if (world !== undefined) {
            log.info('EntityComponentSystem', 'Found ECSY world.')
            this._world = world
            this._events.emit('available', this._world)
          }
        })
      }
    })

    return {
      name: 'ecs',
      api: {
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
        getComponentsManager: () => {
          return this._world.componentsManager
        },
        getEntityManager: () => {
          return this._world.entityManager
        },
        getSystemManager: () => {
          return this._world.systemManager
        },
        getPlayerSystem: () => {
          let s = this._world.systemManager._systems.find(s => s.setOtherPlayerCallbacks)
          return s ?? null
        }
      }
    }
  }

  unhook() {
    throw new Error('To be implemented.')
  }
}
