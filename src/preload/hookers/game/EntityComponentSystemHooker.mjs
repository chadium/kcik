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
    this._setWorldMutationHooker = null
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

    this._events.on('created', () => {
      // TODO: Figure out how to detect when it's destroyed
    })

    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let world = findFirstValueByPredicate(vueAppApi.getModuleState('game'), {
        predicate(o) {
          return 'unregisterSystem' in o
        },
        maxLevel: 3
      })
      if (world !== undefined) {
        log.info('EntityComponentSystem', 'Found ECSY world.')
        this._world = world
        this._events.emit('created', this._world)
        this._events.emit('available', this._world)
      } else {
        log.bad('EntityComponentSystem', 'Could not find ECSY world. Will hook into setWorld and wait for it.')
        this._setWorldMutationHooker = vueAppApi.onceMutation('game/setWorld', (world) => {
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
            this._events.emit('created', this._world)
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
        getWorld: () => {
          return this._world
        },
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
          return this._getPlayerSystem()
        },
        getPlayerEntity: (sessionId) => {
          let playerSystem = this._getPlayerSystem()

          if (playerSystem === null) {
            return null
          }

          return playerSystem.players[sessionId] ?? null
        },
        getPlayerNameComponent: (entity) => {
          for (let component of Object.values(entity._components)) {
            if ('elem' in component && component.elem.type === 'Sprite') {
              // It's probably it.
              return component
            }
          }

          return null
        }
      }
    }
  }

  unhook() {
    throw new Error('To be implemented.')
  }

  _getPlayerSystem() {
    if (this._world === null) {
      return null
    }

    let s = this._world.systemManager._systems.find(s => s.setOtherPlayerCallbacks)
    return s ?? null
  }
}
