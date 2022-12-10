import EventEmitter from 'events'
import * as log from '../../log.mjs'
import * as arrayUtils from '../../array-utils.mjs'

export class KillBarHooker {
  constructor() {
    this._f = (e) => {
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
    }

    this._events = new EventEmitter()
  }

  hook(pimp) {
    let vueAppApi = pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      let app = vueAppApi.getVueApp()

      app.$store._mutations['game/setKillBar'].push(this._f)
    })

    return {
      name: 'killbar',
      api: {
        on: this._events.on.bind(this._events),
        off: this._events.off.bind(this._events),
      }
    }
  }

  unhook(pimp) {
    let vueAppApi = pimp.getApi('vueApp')

    let app = vueAppApi.getVueApp()

    if (app !== null) {
      let mutations = app.$store._mutations['game/setKillBar']

      arrayUtils.removeFirstByValue(mutations, this._f)
    }
  }
}
