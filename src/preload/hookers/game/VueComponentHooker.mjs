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
    this.mounted = new StupidMap()
    this.cleanups = new StupidMap()
    this.idsByName = {}
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    let that = this

    Object.defineProperty(Object.getPrototypeOf({}), '__v_skip', {
      configurable: false,
      enumerable: false,
      set(v) {
        try {
          this._accessCache = v

          const component = this._.type

          if (!that.idsByName[component.__name]) {
            if (component.__name) {
              that.idsByName[component.__name] = component
            }

            that.events.emit('newComponent', {
              id: component
            })
          }
        } catch (e) {
          log.bad(e)
        }
      },
      get() {
        return this._accessCache
      }
    })

    return {
      name: 'vueComponent',
      api: {
        waitForComponentByName: (name, cb) => {
          if (this.idsByName[name]) {
            cb(this.idsByName[name])
          } else {
            const handler = ({ id }) => {
              if (this.idsByName[name]) {
                this.events.off('newComponent', handler)
                cb(this.idsByName[name])
              }
            }

            this.events.on('newComponent', handler)
          }
        },
        
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

        getComponentById: (id) => id,

        addOnRemove: (node, fn) => {
          let functions = this.cleanups.get(node)

          if (functions === undefined) {
            functions = []

            this.cleanups.set(node, functions)

            this.findScope(node).cleanups.push((...args) => {
              for (let fn of functions.concat()) {
                try {
                  fn(args)
                } catch (e) {
                  log.bad('VueComponent', e)
                }
              }

              this.cleanups.del(node)
            })
          }

          functions.push(fn)
        },

        removeOnRemove: (node, fn) => {
          let functions = this.cleanups.get(node)

          if (functions === undefined) {
            return
          }

          arrayUtils.removeFirstByValue(functions, fn)
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

        snapshot: () => {
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

          root = {
            vm: root,
            children: []
          }

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
            for (let node of next.concat()) {
              arrayUtils.removeFirstByValue(next, node)

              if (areTheseChildrenSane(node.vm.children)) {
                for (let child of node.vm.children) {
                  let childNode = {
                    vm: child,
                    children: [],
                    isSubtree: false
                  }
                  node.children.push(childNode)
                  next.push(childNode)
                }
              }

              if (node.vm.component) {
                let childNode = {
                  vm: node.vm.component.subTree,
                  children: [],
                  isSubtree: true
                }
                node.children.push(childNode)
                next.push(childNode)
              }
            }
          }

          return root
        },

        getNodeComponentProxy: (node) => {
          return node.component.proxy
        },

        replaceSetup: (id, replacement) => {
          if (id.originalSetup !== undefined) {
            throw new Error("Setup has already been replaced. Pelase restore first.")
          }

          id.originalSetup = id.setup

          id.setup = (props, ctx) => {
            return replacement(props, ctx, { originalSetup: id.originalSetup })
          }
        },

        restoreSetup: (id) => {
          if (id.originalSetup === undefined) {
            // Nothing to restore.
            return
          }

          id.setup = id.originalSetup
          delete id.originalSetup
        },

        addMounted: (id, fn) => {
          let functions = this.mounted.get(id)

          if (functions === undefined) {
            functions = []

            this.mounted.set(id, functions)

            // Gotta hook then.
            let component = this.getComponentById(id)

            let originalMounted = component.mounted

            component.mounted = function () {
              if (originalMounted) {
                originalMounted.call(this)
              }

              for (let fn of functions.concat()) {
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

        if (areTheseChildrenSane(vm.children)) {
          for (let child of vm.children) {
            next.push(child) // off the cliff.
          }
        }

        if (vm.component) {
          next.push(vm.component.subTree)
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

  getComponentById = (id) => id
}
