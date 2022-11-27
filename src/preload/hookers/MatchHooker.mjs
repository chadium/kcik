import EventEmitter from 'eventemitter3'

export class MatchHooker {
  constructor() {
    this._matchObject = null
    this._found = {}
  }

  hook(pimp) {
    let events = new EventEmitter()

    let playerApi = pimp.getApi('player')
    let roomApi = pimp.getApi('room')
  
    roomApi.on('available', (room) => {
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
            events.emit('playerJoin', {
              player,
              isSelf: player.name === ownName
            })
          } catch (e) {
            console.error(e)
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
            events.emit('playerDeath', {
              player,
              current,
              previous
            })
          })
          player.listen('kills', (current, previous) => {
            console.log(`${player.name} killed`)
            events.emit('playerKill', {
              player,
              current,
              previous
            })
          })
          player.listen('score', (current, previous) => {
            console.log(`${player.name} new score`, current)
            events.emit('playerScore', {
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
            events.emit('playerLeave', {
              player, 
              isSelf: player.name === ownName
            })
          } catch (e) {
            console.error(e)
          }

          delete this._found[sessionId]
        }
      })
    })

    return {
      name: 'match',
      api: {
        on: events.on.bind(events),
        off: events.off.bind(events),
      }
    }
  }

  unhook(pimp) {
  }
}
