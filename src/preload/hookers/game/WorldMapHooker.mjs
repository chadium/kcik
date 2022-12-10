import { Hooker } from '../../Pimp.mjs'

export class WorldMapHooker extends Hooker {
  constructor() {
    super()
    this._game = null
  }

  hook() {
    let vueAppApi = this.pimp.getApi('vueApp')

    vueAppApi.on('available', () => {
      this._game = vueAppApi.getGameObject()
    })

    return {
      name: 'worldMap',
      api: {
        getAll: () => {
          if (this._game === null) {
            return []
          }

          return this._game.mWnwM.mWnwM.mWMnwN
        },
        getByMaterialName: (name) => {
          if (this._game === null) {
            return []
          }

          return this._game.mWnwM.mWnwM.mWMnwN.filter(obj => obj.mWMwN.name === name)
        },
        getByAudioName: (name) => {
          if (this._game === null) {
            return []
          }

          return this._game.mWnwM.mWnwM.mWMnwN.filter(obj => obj.audio === name)
        },
        getUsedMaterials: () => {
          if (this._game === null) {
            return []
          }

          let found = new Set

          this._game.mWnwM.mWnwM.mWMnwN.forEach(obj => {
            if (obj.mWMwN.name !== undefined) {
              found.add(obj.mWMwN.name)
            }
          })

          return [...found]
        },
        getUsedAudio: () => {
          if (this._game === null) {
            return []
          }

          let found = new Set

          this._game.mWnwM.mWnwM.mWMnwN.forEach(obj => found.add(obj.audio))

          return [...found]
        },
        countEveryMaterial: () => {
          if (this._game === null) {
            return []
          }

          let found = {}

          this._game.mWnwM.mWnwM.mWMnwN.forEach(obj => {
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
          if (this._game === null) {
            return []
          }

          let found = {}

          this._game.mWnwM.mWnwM.mWMnwN.forEach(obj => {
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

  unhook() {
  }
}
