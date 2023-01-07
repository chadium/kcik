import EventEmitter from 'events'
import { Hooker } from '../../Pimp.mjs'
import { getByPath, findFirstValueByPredicate, pathsToValue, onPropertyChange } from '../../object-utils.mjs'
import * as log from '../../log.mjs'
import * as componentUtils from '../../component-utils.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

const blacklistedKeys = new Set([
  'pointerLockHelper',
  'renderer',
  'renderingSystem',
  'useMainloop'
])

function guessEmptyEcsyWorldKey(kirkaWorld) {
  let keys = Object.keys(kirkaWorld)

  for (let i = keys.length; i >= 0; i--) {
    let key = keys[i]

    if (kirkaWorld[key] !== null) {
      keys.splice(i, 1)
    }
  }

  keys = keys.filter(k => !blacklistedKeys.has(k))

  if (keys.length !== 1) {
    throw new Error(`Failed to guess key. Got: ${keys}`)
  }

  return keys[0]
}

class State extends MachineState {
  onAvailableListener(listener) {
  }
}

class StateUnknown extends State {
  async [MachineState.ON_ENTER]() {
    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let gameState = vueAppApi.getModuleState('game')

      let ecsyWorld = findFirstValueByPredicate(gameState, {
        predicate(o) {
          return 'unregisterSystem' in o
        },
        maxLevel: 3
      })

      if (ecsyWorld !== undefined) {
        log.info('EntityComponentSystem', 'Found ECSY world.')
        this.machine.hooker._world = ecsyWorld
        this.machine.next(new StateFoundEcsy())
      } else {
        log.warn('EntityComponentSystem', 'Could not find ECSY world.')

        let kirkaWorld = findFirstValueByPredicate(gameState, {
          predicate(o) {
            return 'renderingSystem' in o
          },
          maxLevel: 3
        })

        if (kirkaWorld !== undefined) {
          this.machine.next(new StateWaitingForEcsyWorld())
        } else {
          this.machine.next(new StateWaitingForWorld())
        }
      }
    })
  }
}

class StateWaitingForWorld extends State {
  constructor() {
    super()
    this._onMutation = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('EntityComponentSystem', 'Will be waiting for Kirka world.')

    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')

    this._onMutation = vueAppApi.onceMutation('game/setWorld', (world) => {
      log.info('EntityComponentSystem', 'World was set world. Will search for ECSY world...')

      let ecsyWorld = findFirstValueByPredicate(world, {
        predicate(o) {
          return 'unregisterSystem' in o
        },
        maxLevel: 1
      })

      if (ecsyWorld !== undefined) {
        log.info('EntityComponentSystem', 'Found ECSY world.')
        this.machine.hooker._world = ecsyWorld
        this.machine.next(new StateFoundEcsy())
      } else {
        log.bad('EntityComponentSystem', 'Was not expecting to not find anything.')
        this.machine.next(new StateUnknown())
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this._onMutation.close()
    this._onMutation = null
  }
}

class StateWaitingForEcsyWorld extends State {
  constructor() {
    super()
    this._onPropertyChange = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('EntityComponentSystem', 'Will be waiting for ECSY world.')
    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')
    let gameState = vueAppApi.getModuleState('game')

    let kirkaWorld = findFirstValueByPredicate(gameState, {
      predicate(o) {
        return 'renderingSystem' in o
      },
      maxLevel: 3
    })

    if (kirkaWorld === undefined) {
      log.bad('EntityComponentSystem', 'Was not expecting to not find kirka world.')
      this.machine.next(new StateUnknown())
      return
    }

    let key = guessEmptyEcsyWorldKey(kirkaWorld)

    this._onPropertyChange = onPropertyChange(kirkaWorld, key, (ecsyWorld) => {
      if (ecsyWorld !== null) {
        log.info('EntityComponentSystem', 'Found ECSY world.')
        this.machine.hooker._world = ecsyWorld
        this.machine.next(new StateFoundEcsy())
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this._onPropertyChange.close()
  }
}

class StateFoundEcsy extends State {
  constructor() {
    super()
    this._onPropertyChange = null
    this._boomerSystemClass = null
  }

  async [MachineState.ON_ENTER]() {
    this.machine.hooker._events.emit('created', this.machine.hooker._world)
    this.machine.hooker._events.emit('available', this.machine.hooker._world)

    let vueAppApi = this.machine.hooker.pimp.getApi('vueApp')
    let gameState = vueAppApi.getModuleState('game')

    let kirkaWorldPath = this.pathToEcsyWorld(gameState)
    let key = kirkaWorldPath.pop()

    let kirkaWorld = getByPath(gameState, kirkaWorldPath)

    this.registerBoomerSystem()

    this._onPropertyChange = onPropertyChange(kirkaWorld, key, (ecsyWorld) => {
      if (ecsyWorld === null) {
        log.info('EntityComponentSystem', 'Lost ECSY world.')
        this.machine.next(new StateWaitingForEcsyWorld())
      }
    })
  }

  async [MachineState.ON_LEAVE]() {
    this.unregisterBoomerSystem()
    this._onPropertyChange.close()
    this.machine.hooker._world = null
  }

  pathToEcsyWorld(gameState) {
    let paths = pathsToValue(gameState, this.machine.hooker._world)

    if (paths.length === 0) {
      throw new Error('Was expecting to find a path to ecsy world. Found none. Do not know what to do.')
    }

    // Remove any paths that contain the property parent. These seem to come from the renderer.
    paths = paths.filter(path => !path.includes('parent'))

    // Remove any paths that contain the property _entityManager. The entity manager seems to have
    // a reference to the kirka world.
    paths = paths.filter(path => !path.includes('_entityManager'))

    if (paths.length === 0) {
      throw new Error('No paths left after filtering. Do not know what to do.')
    }

    if (paths.length !== 1) {
      log.warn('EntityComponentSystem', 'Got more than 1 path to ecsy world object. This might cause problems.')
    }

    return paths[0]
  }

  registerBoomerSystem() {
    let donor = this.machine.hooker._world.systemManager._systems[0]
    let systemClass = Object.getPrototypeOf(Object.getPrototypeOf(donor)).constructor

    if (!systemClass.prototype.hasOwnProperty('clearEvents')) {
      log.warn('EntityComponentSystem', 'The obtained system class does not own clearEvents. That is sus.')
    }

    if (!systemClass.hasOwnProperty('isSystem')) {
      log.warn('EntityComponentSystem', 'The obtained system class constructor does not have isSystem set. That is very bad.')
    }

    let hooker = this.machine.hooker

    class BoomerSystem extends systemClass {
      constructor(world) {
        super(world)
        this.first = true
      }

      execute(delta) {
        if (this.first) {
          this.first = false

          for (let entity of this.queries.players.results) {
            hooker._events.emit('playerEntityAdded', entity)
          }
        }

        if (this.queries.players.added.length > 0) {
          log.info('EntityComponentSystem', `Added ${this.queries.players.added.length} new players`)

          for (let entity of this.queries.players.added) {
            hooker._events.emit('playerEntityAdded', entity)
          }
        }

        if (this.queries.players.removed.length > 0) {
          log.info('EntityComponentSystem', `Removed ${this.queries.players.removed.length} new players`)

          for (let entity of this.queries.players.added) {
            hooker._events.emit('playerEntityRemoved', entity)
          }
        }

        // TODO: Need to emit playerEntityRemoved when system is going down.
      }
    }

    let CommonPlayerComponent = componentUtils.findCommonPlayerComponent(this.machine.hooker._world.componentsManager)

    if (CommonPlayerComponent !== null) {
      BoomerSystem.queries = {
        players: {
          listen: {
            added: true,
            removed: true,
          },
          components: [CommonPlayerComponent]
        }
      }
    }

    this._boomerSystemClass = BoomerSystem

    this.machine.hooker._world.registerSystem(this._boomerSystemClass)
  }

  unregisterBoomerSystem() {
    this.machine.hooker._world.unregisterSystem(this._boomerSystemClass)
  }
}

export class EntityComponentSystemHooker extends Hooker {
  constructor() {
    super()
    this._world = null
    this._state = new Machine({ base: State })
    this._state.hooker = this
    this._events = new EventEmitter()
  }

  async hook() {
    await this._state.start(new StateUnknown())

    this._events.on('newListener', async (name, listener) => {
      if (name === 'available') {
        let state = await this._state.state()
        state.onAvailableListener(listener)
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

  async unhook() {
    await this._state.stop()
  }

  _getPlayerSystem() {
    if (this._world === null) {
      return null
    }

    let s = this._world.systemManager._systems.find(s => s.setOtherPlayerCallbacks)
    return s ?? null
  }
}
