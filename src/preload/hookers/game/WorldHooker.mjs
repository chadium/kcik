import EventEmitter from 'events'
import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { isObject } from '../../object-utils.mjs'
import * as kirkaSceneUtils from '../../kirka-scene-utils.mjs'

export class WorldHooker extends Hooker {
  constructor() {
    super()
    this._f = (world) => {
      log.info('World', 'World was set world. Saving it.')
      this._world = world
      this._events.emit('available', this._world)
    }

    this._world = null
    this._events = new EventEmitter()
  }

  hook() {
    this._events.on('newListener', (name, listener) => {
      if (name === 'available') {
        if (this._world !== null) {
          listener(this._world)
        }
      }
    })

    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let gameObject = vueAppApi.getGameObject()

      for (let value of Object.values(gameObject)) {
        if (isObject(value) && value.renderer !== undefined) {
          log.info('World', 'Found world.')
          this._world = value
          this._events.emit('available', this._world)
          return
        }
      }

      log.warn('World', 'Could not find renderer. Will hook into setWorld and wait for it.')
      vueAppApi.getVueApp().$store._mutations['game/setWorld'].push(this._f)
    })

    return {
      name: 'world',
      api: {
        getWorld: () => { return this._world },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
        addPovOffset: (x, y, z) => {
          if (x !== undefined) {
            this._world.renderingSystem.scene2.children[0].children[0].position.x += x
          }
          if (y !== undefined) {
            this._world.renderingSystem.scene2.children[0].children[0].position.y += y
          }
          if (z !== undefined) {
            this._world.renderingSystem.scene2.children[0].children[0].position.z += z
          }
        },
        getScene: () => {
          return this._world.renderingSystem.scene
        },
        getScene2: () => {
          return this._world.renderingSystem.scene2
        },
        getSceneObjectNames: () => {
          let found = new Set()

          kirkaSceneUtils.forAllObjects(this._world.renderingSystem.scene, (obj) => {
            found.add(obj.name)
          })

          return [...found]
        },
        getSceneObjectTypes: () => {
          let found = new Set()

          kirkaSceneUtils.forAllObjects(this._world.renderingSystem.scene, (obj) => {
            found.add(obj.type)
          })

          return [...found]
        },
        countSceneObjectTypes: () => {
          let count = {}

          kirkaSceneUtils.forAllObjects(this._world.renderingSystem.scene, (obj) => {
            if (count[obj.type] === undefined) {
              count[obj.type] = 0
            }

            count[obj.type] += 1
          })

          return count
        },
        getScene2ObjectNames: () => {
          let found = new Set()

          kirkaSceneUtils.forAllObjects(this._world.renderingSystem.scene2, (obj) => {
            found.add(obj.name)
          })

          return [...found]
        },
      }
    }
  }

  unhook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    let app = vueAppApi.getVueApp()

    if (app !== null) {
      let mutations = app.$store._mutations['game/setWorld']

      arrayUtils.removeFirstByValue(mutations, this._f)
    }
  }
}
