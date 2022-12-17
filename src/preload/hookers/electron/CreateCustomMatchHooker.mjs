import { Hooker } from '../../Pimp.mjs'
import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CreateCustomMatch from '../../components/CreateCustomMatch.jsx'
import { CustomTeamDeathMatchHooker } from '../custom-matches/CustomTeamDeathMatchHooker.mjs'
import { CustomTagMatchHooker } from '../custom-matches/CustomTagMatchHooker.mjs'
import { CustomTagMatchUiHooker } from '../custom-matches/CustomTagMatchUiHooker.mjs'
import * as adminApi from '../../admin-api.mjs'
import * as log from '../../log.mjs'

export class CreateCustomMatchHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
  }

  hook() {
    const vueAppApi = this.pimp.getApi('vueApp')
    const roomApi = this.pimp.getApi('room')
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    ipcRenderer.on('menu.create-custom-match.click', async () => {
      try {
        let gameObject = vueAppApi.getModuleState('game')
        let maps = Object.values(gameObject.mods.DeathmatchRoom.maps).map(map => ({
          label: map,
          value: map
        }))
        let weapons = Object.values(gameObject.weapons).map(w => ({
          label: w.name,
          value: w.type
        }))

        let options = await new Promise((resolve, reject) => {
          const onCreate = (e) => {
            resolve(e)
          }

          const onCancel = () => {
            reject(new Error('Cancelled'))
          }

          this._reactRoot.render(React.createElement(CreateCustomMatch, { show: true, maps, weapons, onCreate, onCancel }, null))
        })

        let { roomId, regionId } = await roomApi.createRoom(options.kirkaOptions)

        if (BOOMER_ADMIN) {
          log.info('CreateCustomMatch', `Creating custom match in room ${roomId}`)
          await adminApi.matchSet(regionId, roomId, options.type)
        }
      } finally {
        this._reactRoot.render(React.createElement(CreateCustomMatch, { show: false }, null))
      }
    })
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()
  }
}
