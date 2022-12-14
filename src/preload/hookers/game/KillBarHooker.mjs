import { Hooker } from '../../Pimp.mjs'
import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as arrayUtils from '../../array-utils.mjs'

export class KillBarHooker extends Hooker {
  constructor() {
    super()
    this._killbarMutation = 

    this._events = new EventEmitter()
  }

  hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      vueAppApi.onMutation('game/setKillBar', (e) => {
        if (e.killer === undefined) {
          log.info('KillBar', `${e.dead} has killed himself`)
  
          this._events.emit('suicide', {
            deadPlayerName: e.dead
          })
        } else {
          log.info('KillBar', `${e.killer} killed ${e.dead} ${e.head ? '(headshot)' : ''}`)
  
          this._events.emit('kill', {
            deadPlayerName: e.dead,
            killerPlayerName: e.killer,
            headshot: e.head,
            weaponName: e.weapon,
          })
        }
      })
    })

    return {
      name: 'killbar',
      api: {
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook() {
    if (this._killbarMutation !== null) {
      this._killbarMutation.close()
      this._killbarMutation = null
    }
  }
}
