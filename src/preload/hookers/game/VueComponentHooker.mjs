import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import { StupidMap } from '../../StupidMap.mjs'
import * as log from '../../log.mjs'
import * as arrayUtils from '../../array-utils.mjs'
import * as objectUtils from '../../object-utils.mjs'

const shapeFlags = {
  ELEMENT: 1,
  FUNCTIONAL_COMPONENT: 1 << 1,
  STATEFUL_COMPONENT: 1 << 2,
  TEXT_CHILDREN: 1 << 3,
  ARRAY_CHILDREN: 1 << 4,
  SLOTS_CHILDREN: 1 << 5,
  TELEPORT: 1 << 6,
  SUSPENSE: 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE: 1 << 8,
  COMPONENT_KEPT_ALIVE: 1 << 9,
}
shapeFlags.COMPONENT = shapeFlags.STATEFUL_COMPONENT | shapeFlags.FUNCTIONAL_COMPONENT


const patchFlags = {
  TEXT: 1,
  CLASS: 1 << 1,
  STYLE: 1 << 2,
  PROPS: 1 << 3,
  FULL_PROPS: 1 << 4,
  HYDRATE_EVENTS: 1 << 5,
  STABLE_FRAGMENT: 1 << 6,
  KEYED_FRAGMENT: 1 << 7,
  UNKEYED_FRAGMENT: 1 << 8,
  NEED_PATCH: 1 << 9,
  DYNAMIC_SLOTS: 1 << 10,
  DEV_ROOT_FRAGMENT: 1 << 11,
  HOISTED: -1,
  BAIL: -2
}


export class VueComponentHooker extends Hooker {
  constructor() {
    super()
    this.events = new EventEmitter()
    this.mounted = new StupidMap()
    this.cleanups = new StupidMap()
    this.idsByName = {}
    this.refConstructor = null
  }

  async hook() {
    const vueAppApi = this.pimp.getApi('vueApp')

    let that = this

    Object.defineProperty(Object.getPrototypeOf({}), '__v_skip', {
      configurable: false,
      enumerable: false,
      set(v) {
        try {
          this.___v_skip = v

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
        return this.___v_skip
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
          let routeRoot = objectUtils.getByPath(vueAppApi.getVueApp(), [
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

          const root = {
            vm: routeRoot.ctx.root.vnode,
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

        replaceSlot: (node, slotName, replacement) => {
          const originalSlot = node.children[slotName]

          node.children[slotName] = (props) => {
            return replacement(props, { originalSlot })
          }
        },

        addMounted: (id, fn) => {
          let functions = this.mounted.get(id)

          if (functions === undefined) {
            functions = []

            // Gotta hook then.
            this.takeOverMounted(id, functions)
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

        ref: (value) => {
          if (this.refConstructor === null) {
            const donor = vueAppApi.getVueApp().config.globalProperties.$pinia.state

            if (donor === null) {
              throw new Error('Could not find a donor')
            }

            this.refConstructor = Object.getPrototypeOf(donor).constructor
          }

          return new this.refConstructor(value)
        },

        h(type, props = null, children = null) {
          const node = {
            __v_isVNode: true,
            __v_skip: true,
            type,
            props,
            children,
            component: null,
            suspense: null,
            ssContent: null,
            ssFallback: null,
            dirs: null,
            transition: null,
            el: null,
            anchor: null,
            target: null,
            targetAnchor: null,
            staticCount: 0,
            shapeFlag: shapeFlags.ELEMENT,
            patchFlag: 0,
            dynamicProps: null,
            dynamicChildren: null,
            appContext: null,

            // This needed currentRenderingInstance.
            ctx: null
          }

          return node
        },

        patchFlags,
        shapeFlags,

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

  takeOverMounted(id, functions) {
    this.mounted.set(id, functions)

    const component = this.getComponentById(id)

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

    // Must check if the options cache for this component has
    // already been created. If so, need to update the mounted
    // function.
    const vueAppApi = this.pimp.getApi('vueApp')
    const optionsCache = vueAppApi.getVueApp()._context.optionsCache.get(component)

    if (optionsCache) {
      optionsCache.mounted = component.mounted
    }
  }
}
