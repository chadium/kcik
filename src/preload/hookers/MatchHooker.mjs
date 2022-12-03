import EventEmitter from 'eventemitter3'
import * as log from '../log.mjs'

export class MatchHooker {
  constructor() {
    this._matchObject = null
    this._found = {}
    this._events = new EventEmitter()
  }

  hook(pimp) {
    let playerApi = pimp.getApi('player')
    let roomApi = pimp.getApi('room')

    roomApi.on('joined', ({ room }) => {
      room.onStateChange((e) => {
        let ownName = playerApi.getName()

        let found = Object.assign({}, this._found)

        for (let player of e.players.values()) {
          if (player.sessionId in found) {
            delete found[player.sessionId]
            continue 
          }

          // New player.
          this._found[player.sessionId] = player

          try {
            this._events.emit('playerJoin', {
              player,
              isSelf: player.name === ownName
            })
          } catch (e) {
            log.bad('MatchHooker', e)
          }

          // let l
          // Object.defineProperty(player.death, 'onAdd', {
          //   configurable: false,
          //   get() {
          //     return l
          //   },
          //   set(f) {
          //     debugger
          //     l = f
          //   }
          // });

          player.listen('deaths', (current, previous) => {
            console.log(`${player.name} got killed`)
            this._events.emit('playerDeath', {
              player,
              current,
              previous
            })
          })
          player.listen('kills', (current, previous) => {
            console.log(`${player.name} killed`)
            this._events.emit('playerKill', {
              player,
              current,
              previous
            })
          })
          player.listen('score', (current, previous) => {
            console.log(`${player.name} new score`, current)
            this._events.emit('playerScore', {
              player,
              current,
              previous
            })
          })
        }

        for (let sessionId in found) {
          // Player left.

          let player = this._found[sessionId]

          try {
            this._events.emit('playerLeave', {
              player, 
              isSelf: player.name === ownName
            })
          } catch (e) {
            log.bad(e)
          }

          delete this._found[sessionId]
        }
      })
    })

    roomApi.on('leaved', ({ room }) => {
      let ownName = playerApi.getName()
      
      for (let sessionId in this._found) {
        let player = this._found[sessionId]

        try {
          this._events.emit('playerLeave', {
            player, 
            isSelf: player.name === ownName
          })
        } catch (e) {
          log.bad(e)
        }

        delete this._found[sessionId]
      }
    })

    return {
      name: 'match',
      api: {
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
  }
}
