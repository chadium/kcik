export class WorldMapHooker {
  constructor() {
    this._thatMysteryObject = null
  }

  hook(pimp) {
    pimp.getApi('mystery').on('available', (object) => {
      this._thatMysteryObject = object
    })

    return {
      name: 'worldMap',
      api: {
        getAll: () => {
          if (this._thatMysteryObject === null) {
            return []
          }

          return this._thatMysteryObject.mWnwM.mWMnwN
        },
        getByMaterialName: (name) => {
          if (this._thatMysteryObject === null) {
            return []
          }

          return this._thatMysteryObject.mWnwM.mWMnwN.filter(obj => obj.mWMwN.name === name)
        },
        getByAudioName: (name) => {
          if (this._thatMysteryObject === null) {
            return []
          }

          return this._thatMysteryObject.mWnwM.mWMnwN.filter(obj => obj.audio === name)
        },
        getUsedMaterials: () => {
          if (this._thatMysteryObject === null) {
            return []
          }

          let found = new Set

          this._thatMysteryObject.mWnwM.mWMnwN.forEach(obj => {
            if (obj.mWMwN.name !== undefined) {
              found.add(obj.mWMwN.name)
            }
          })

          return [...found]
        },
        getUsedAudio: () => {
          if (this._thatMysteryObject === null) {
            return []
          }

          let found = new Set

          this._thatMysteryObject.mWnwM.mWMnwN.forEach(obj => found.add(obj.audio))

          return [...found]
        },
        countEveryMaterial: () => {
          if (this._thatMysteryObject === null) {
            return []
          }

          let found = {}

          this._thatMysteryObject.mWnwM.mWMnwN.forEach(obj => {
            if (obj.mWMwN.name === undefined) {
              return
            }

            if (!found[obj.mWMwN.name]) {
              found[obj.mWMwN.name] = 0
            }

            found[obj.mWMwN.name] += 1
          })

          return found
        },
        countEveryAudio: () => {
          if (this._thatMysteryObject === null) {
            return []
          }

          let found = {}

          this._thatMysteryObject.mWnwM.mWMnwN.forEach(obj => {
            if (!found[obj.audio]) {
              found[obj.audio] = 0
            }

            found[obj.audio] += 1
          })

          return found
        },
      }
    }
  }

  unhook(pimp) {
  }
}
