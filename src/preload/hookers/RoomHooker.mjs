import EventEmitter from 'eventemitter3'

export class RoomHooker {
  constructor() {
    this._worldObject = null
  }

  hook(pimp) {
    pimp.getApi('world').on('available', (world) => {
      this._worldObject = world
    })

    return {
      name: 'room',
      api: {
        getRoom: () => this._worldObject.room
      }
    }
  }

  unhook(pimp) {
  }
}
