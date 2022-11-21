import EventEmitter from 'eventemitter3'

class StateUnknown {
  constructor() {

  }
}

export class MatchHooker {
  constructor() {
    this._matchObject = null
    this._isInMatch = false
  }

  hook(pimp) {
    let events = new EventEmitter()

    let self = this

    Object.defineProperty(Object.prototype, '_players', {
      configurable: true,
      set(v) {
        // It needs to have the mapName property.
        if ('mapName' in this) {
          // Can't be whatever this is.
          if (typeof v === 'object' && !('configurable' in v)) {
            // Found it.
            console.log('Game has assigned _players')
            self._matchObject = this
            //delete Object.prototype._players
          }
        }

        this._superUniqueProperty = v
      },
      get() {
        return this._superUniqueProperty
      }
    })

    return {
      name: 'match',
      api: {
        isInMatch: () => this._isInMatch,
        getMapName: () => this._matchObject.mapName,
        getState: () => this._matchObject.state,
        getServerTime: () => this._matchObject.serverTime,
        getServerTime: () => this._matchObject.serverTime,
        getType: () => this._matchObject.type,
        on: events.on.bind(events),
        off: events.off.bind(events),
      }
    }
  }

  unhook(pimp) {
  }
}
