import { Hooker } from '../../Pimp.mjs'
import { findKey, getByPath } from '../../object-utils.mjs'
import * as log from '../../log.mjs'

export class EntityComponentSystemHooker extends Hooker {
  constructor() {
    super()
    this._gameObject = null
    this._componentsManager = null
    this._entityManager = null
    this._systemManager = null
  }

  hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      this._gameObject = vueAppApi.getGameObject()

      {
        let paths = findKey(this._gameObject, 'componentsManager')
        if (paths.length === 0) {
          log.bad('GameEntityComponentSystem', 'No path to componentsManager')
          return
        }
        this._componentsManager = getByPath(this._gameObject, paths[0])
        log.info('GameEntityComponentSystem', 'Found Components Manager')
      }

      {
        let paths = findKey(this._gameObject, 'entityManager')
        if (paths.length === 0) {
          log.bad('GameEntityComponentSystem', 'No path to entityManager')
          return
        }
        this._entityManager = getByPath(this._gameObject, paths[0])
        log.info('GameEntityComponentSystem', 'Found Entity Manager')
      }

      {
        let paths = findKey(this._gameObject, 'systemManager')
        if (paths.length === 0) {
          log.bad('GameEntityComponentSystem', 'No path to systemManager')
          return
        }
        this._systemManager = getByPath(this._gameObject, paths[0])
        log.info('GameEntityComponentSystem', 'Found System Manager')
      }
    })

    return {
      name: 'ecs',
      api: {
        getComponentsManager: () => {
          return this._componentsManager
        },
        getEntityManager: () => {
          return this._entityManager
        },
        getSystemManager: () => {
          return this._systemManager
        },
        getPlayerSystem: () => {
          let s = this._systemManager._systems.find(s => s.setOtherPlayerCallbacks)
          return s ?? null
        }
      }
    }
  }

  unhook() {
    throw new Error('To be implemented.')
  }
}
