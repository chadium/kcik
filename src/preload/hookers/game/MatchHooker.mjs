import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'

export class MatchHooker extends Hooker {
  constructor() {
    super()
    this._found = {}
    this._events = new EventEmitter()
  }

  hook() {
    let playerApi = this.pimp.getApi('player')
    let roomApi = this.pimp.getApi('room')
    let ecsApi = this.pimp.getApi('ecs')

    this._events.on('newListener', (name, listener) => {
      if (name === 'matchAvailable') {
        let room = roomApi.getRoom()
        if (room !== null) {
          listener({})
        }
      }
    })

    ecsApi.on('available', () => {
      roomApi.on('joined', ({ room }) => {
        this._events.emit('matchJoin', {})
      })

      roomApi.on('available', ({ room }) => {
        this._events.emit('matchAvailable', {})

        room.onStateChange((e) => {
          try {
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
                  playerName: player.name
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
                log.info('Match', `${player.name} got killed`)
                this._events.emit('playerDeath', {
                  playerName: player.name,
                  current,
                  previous
                })
              })
              player.listen('kills', (current, previous) => {
                log.info('Match', `${player.name} killed`)
                this._events.emit('playerKill', {
                  playerName: player.name,
                  current,
                  previous
                })
              })
              player.listen('score', (current, previous) => {
                log.info('Match', `${player.name} new score`, current)
                this._events.emit('playerScore', {
                  playerName: player.name,
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
                  playerSessionId: player.sessionId,
                  playerName: player.name
                })
              } catch (e) {
                log.bad(e)
              }

              delete this._found[sessionId]
            }
          } catch (e) {
            log.bad('MatchHooker', e)
          }
        })
      })

      roomApi.on('leaved', ({ room }) => {
        for (let sessionId in this._found) {
          let player = this._found[sessionId]
  
          try {
            this._events.emit('playerLeave', {
              playerName: player.name
            })
          } catch (e) {
            log.bad(e)
          }
  
          delete this._found[sessionId]
        }
  
        this._events.emit('matchLeave', {})
      })

      let killbarApi = this.pimp.getApi('killbar')
  
      killbarApi.on('kill', ({ deadPlayerName, killerPlayerName, headshot }) => {
        this._events.emit('kill', {
          deadPlayerName,
          killerPlayerName,
          headshot
        })
      })
  
      killbarApi.on('suicide', ({ deadPlayerName }) => {
        this._events.emit('suicide', {
          deadPlayerName
        })
      })
    })

    return {
      name: 'match',
      api: {
        getPlayerNames: () => {
          return Object.values(this._found).map(p => p.name)
        },
        getSessionIdByName: (name) => {
          for (let player of Object.values(this._found)) {
            if (player.name === name) {
              return player.sessionId
            }
          }

          return null
        },
        getOtherPlayerIdentifications: () => {
          let mySessionId = playerApi.getSessionId()

          return Object.values(this._found)
            .filter(p => p.sessionId !== mySessionId)
            .map(p => ({
              name: p.name,
              sessionId: p.sessionId,
            }))
        },
        showRankingScreen: (state) => {
          pimp.getApi('vueApp').getVueApp().$store.commit('app/WNnMwm', state)
        },
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook() {
    throw new Error('To be implemented.')
  }
}
