import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CreateCustomMatch from '../../components/CreateCustomMatch.jsx'
import { CustomTeamDeathMatchHooker } from '../custom-matches/CustomTeamDeathMatchHooker.mjs'
import { CustomTagMatchHooker } from '../custom-matches/CustomTagMatchHooker.mjs'
import { CustomTagMatchUiHooker } from '../custom-matches/CustomTagMatchUiHooker.mjs'
import * as adminApi from '../../admin-api.mjs'
import * as log from '../../log.mjs'

export class CreateCustomMatchHooker {
  constructor() {
  }

  hook(pimp) {
    const root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    const vueAppApi = pimp.getApi('vueApp')
    const roomApi = pimp.getApi('room')

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('create-custom-match', async () => {
      try {
        let gameObject = vueAppApi.getGameObject()
        let maps = Object.values(gameObject.maps).map(w => ({
          label: w.name,
          value: w.type
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

          reactRoot.render(React.createElement(CreateCustomMatch, { show: true, maps, weapons, onCreate, onCancel }, null))
        })

        let { roomId, regionId } = await roomApi.createRoom(options.kirkaOptions)

        log.info('CreateCustomMatch', `Creating custom match in room ${roomId}`)
        await adminApi.matchSet(regionId, roomId, options.type)
      } finally {
        reactRoot.render(React.createElement(CreateCustomMatch, { show: false }, null))
      }
    })
  }

  unhook(pimp) {
  }
}
