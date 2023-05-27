import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { StupidMap } from '../../StupidMap.mjs'
import * as log from '../../log.mjs'
import * as arrayUtils from '../../array-utils.mjs'
import * as objectUtils from '../../object-utils.mjs'

export class VueComponentHooker extends Hooker {
  constructor() {
    super()
    this.events = new EventEmitter()
    this.optionsCache = null
    this.mounted = new StupidMap()
    this.idsByName = {}
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    let that = this

    vueAppApi.on('available', (vueApp) => {
      this.optionsCache = vueApp._context.optionsCache

      this.optionsCache.set = function (key, value) {
        let existed = this.has(key)

        WeakMap.prototype.set.call(this, key, value)

        if (!existed) {
          if (key.__name) {
            that.idsByName[key.__name] = key
          }

          that.events.emit('newComponent', {
            id: key
          })
        }
      }
    })

    return {
      name: 'vueComponent',
      api: {
        getComponentIdByName: (name) => {
          return this.idsByName[name] ?? null
        },

        getComponentName: (id) => {
          if (id.__name) {
            return id.__name
          } else {
            return null
          }
        },

        addOnRemove: (node, fn) => {
          this.findScope(node).cleanups.push(fn)
        },

        removeOnRemove: (node, fn) => {
          arrayUtils.removeFirstByValue(this.findScope(node).cleanups, fn)
        },

        findNodesByComponent: (id) => {
          let root = objectUtils.getByPath(vueAppApi.getVueApp(), [
            "_container",
            "_vnode",
            "component",
            "appContext",
            "app",
            "config",
            "globalProperties",
            "$router",
            "currentRoute",
            "_rawValue",
            "matched",
            "0",
            "instances",
            "default",
            "_",
            "vnode"
          ])

          return this.findNodes(root, (vm) => vm.type === id)
        },

        getNodeComponentProxy: (node) => {
          return node.component.proxy
        },

        addMounted: (id, fn) => {
          if (!this.optionsCache.has(id)) {
            throw new Error('Component has not been seen yet')
          }

          let functions = this.mounted.get(id)

          if (functions === undefined) {
            functions = []

            this.mounted.set(id, functions)

            // Gotta hook then.
            let value = this.optionsCache.get(id)

            let originalMounted = value.mounted

            value.mounted = function () {
              if (originalMounted) {
                originalMounted.call(this)
              }

              for (let fn of functions) {
                try {
                  fn(this)
                } catch (e) {
                  log.bad('VueComponent', e)
                }
              }
            }
          }

          functions.push(fn)
        },

        removeMounted: (id, fn) => {
          let functions = this.mounted.get(id)

          if (functions === undefined) {
            return
          }

          arrayUtils.removeFirstByValue(functions, fn)
        },

        on: this.events.on.bind(this.events),
        off: this.events.off.bind(this.events),
      }
    }
  }

  async unhook() {
  }

  findNodes(root, predicate) {
    let results = []
    let next = [root]

    function areTheseChildrenSane(children) {
      if (children === null) {
        return false
      }
      
      if (!(children instanceof Array)) {
        return false
      }

      return true
    }

    while (next.length > 0) {
      for (let vm of next.concat()) {
        arrayUtils.removeFirstByValue(next, vm)

        if (vm.component) {
          if (areTheseChildrenSane(vm.component.subTree.children)) {
            for (let child of vm.component.subTree.children) {
              next.push(child) // off the cliff.
            }
          }
        } else {
          if (areTheseChildrenSane(vm.children)) {
            for (let child of vm.children) {
              next.push(child) // off the cliff.
            }
          }
        }

        try {
          if (predicate(vm)) {
            results.push(vm)
          }
        } catch (e) {
          log.bad('VueComponent', e)
        }
      }
    }

    return results
  }

  findScope(node) {
    let scope = undefined

    if (node.component) {
      scope = node.component.scope
    } else if (node._) {
      scope = node._.scope
    }

    if (scope === undefined) {
      throw new Error('Scope not found')
    }

    return scope
  }
}
