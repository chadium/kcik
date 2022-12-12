import { Hooker } from '../../Pimp.mjs'
import { hijackPropertyWithMemory, pathsToPredicate } from '../../object-utils.mjs'

class Modded {
  constructor(component, field, state) {
    this.component = component
    this.state = state
    this.accessorHandle = hijackPropertyWithMemory(component, field, {
      get: () => this.state
    })
  }

  set(value) {
    this.state = value
    // Somebody needs to update it. The game only updates
    // the visibility flag under certain circumstances, such as
    // when a player gets hit.
    this.component.elem.visible = this.state
  }

  close() {
    this.accessorHandle.close()
  }
}

export class PlayerNameVisibilityHooker extends Hooker {
  constructor() {
    super()
    this._modded = {}
    this._boolField = null
  }

  hook() {
    let matchApi = this.pimp.getApi('match')
    let ecsApi = this.pimp.getApi('ecs')

    matchApi.on('playerLeave', ({ playerSessionId }) => {
      if (this._modded[playerSessionId]) {
        this._modded[playerSessionId].close()
        delete this._modded[playerSessionId]
      }
    })

    return {
      name: 'playerNameVisibility',
      api: {
        takeControl: (sessionId, state = true) => {
          if (this._modded[sessionId]) {
            // Already done.
            this._modded[sessionId].set(state)
            return
          }

          let entity = ecsApi.getPlayerEntity(sessionId)

          if (entity === null) {
            throw new Error(`Entitiy of ${sessionId} not found`)
          }

          let component = ecsApi.getPlayerNameComponent(entity)

          if (component === null) {
            throw new Error(`Player name component of ${sessionId} not found`)
          }

          if (this._boolField === null) {
            this._findBoolField(component)
          }

          this._modded[sessionId] = new Modded(component, this._boolField, state)
        },
        clear: () => {
          for (let sessionId in this._modded) {
            this._modded[sessionId].close()
            delete this._modded[sessionId]
          }
        }
      }
    }
  }

  unhook() {
    throw new Error('To be implemented.')
  }

  _findBoolField(component) {
    let paths = pathsToPredicate(component, {
      predicate(value) {
        return typeof value === 'boolean'
      },
      maxLevel: 1
    })

    if (paths.length !== 1) {
      throw new Error(`Unable to find boolean field. Got ${paths.length}`)
    }

    this._boolField = paths[0][0]
  }
}
