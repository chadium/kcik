import * as log from '../log.mjs'

let known = {
  "metadata": 0,
  "initMap": 1,
  "messages": 2,
  "WmMwnN": 3,
  "WmwNM": 4,
  "Wnmw": 5,
  "AFK": 6,
  "WmwNMn": 7,
  "coins": 8,
  "Wmwn": 9,
  "WmwnM": 10,
  "wNM": 11,
  "wNMs": 12,
  "pong": 13,
  "yellowFlagPlaces": 14,
  "testPosition": 15,
  "playerState": 16,
  "mapJson": 17,
  "importMapDone": 18
}

export class SniffRoomMessagesHooker {
  constructor() {
    this._registered = {}
    this._onJoined = ({ room }) => {
      log.info('SniffRoom', 'hook sniff')
      for (let [name, value] of Object.entries(known)) {
        log.info('SniffRoom', `Registering ${name}`)
        this._registered[name] = (e) => {
          log.info('SniffRoom', `Got message ${name}:`, e)
        }
        room.onMessageHandlers.on(room.getMessageHandlerKey(value), this._registered[name])
      }
    }
    this._onLeaved = ({ room }) => {
      for (let [name, cb] of Object.entries(this._registered)) {
        // There is no off method. What can I do?
        //room.onMessageHandlers.off(room.getMessageHandlerKey(known[name]), cb)
        delete this._registered[name]
      }
    }
  }

  hook(pimp) {
    let roomApi = pimp.getApi('room')

    roomApi.on('joined', this._onJoined)
    roomApi.on('leaved', this._onLeaved)
  }

  unhook(pimp) {
    let roomApi = pimp.getApi('room')

    roomApi.off('joined', this._onJoined)
    roomApi.off('leaved', this._onLeaved)

    let room = roomApi.getRoom()

    if (room !== null) {
      // All the login is in this callback.
      this._onLeaved({ room })
    }

    // Sanity check
    if (Object.keys(this._registered).length > 0) {
      log.warn('SniffRoom', 'There are still some event handlers left.')
    }
  }
}
