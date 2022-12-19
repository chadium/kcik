import { Hooker } from '../../Pimp.mjs'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class BoomerTimeHooker extends Hooker {
  constructor() {
    super()
    this._delay = 0
  }

  hook() {
    let timeBeforeRequest = Date.now()

    userApi.timeGet()
      .then((time) => {
        let timeAfterRequest = Date.now()

        let requestDuration = timeAfterRequest - timeBeforeRequest

        let now = Date.now()
        this._delay = Math.floor((now - time)) + (requestDuration / 2)
        log.info('Time', `The delay between client and server is: ${this._delay}ms`)
      })

    return {
      name: 'time',
      api: {
        delay: () => {
          return this._delay
        },
        now: () => {
          return Date.now() - this._delay
        }
      }
    }
  }
}
