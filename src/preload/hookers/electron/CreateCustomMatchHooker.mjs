import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CreateCustomMatch from '../../components/CreateCustomMatch.jsx'
import { CustomTeamDeathMatchHooker } from '../custom-matches/CustomTeamDeathMatchHooker.mjs'
import { CustomTagMatchHooker } from '../custom-matches/CustomTagMatchHooker.mjs'
import * as userApi from '../../user-api.mjs'
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

        let id = await roomApi.createRoom(options.kirkaOptions)

        log.info('CreateCustomMatch', `Creating custom match in room ${id}`)

        async function onJoin() {
          if (options.type === 'tag') {
            await pimp.register(new CustomTagMatchHooker())
          } else if (options.type === 'multi-team-deathmatch') {
            await pimp.register(new CustomTeamDeathMatchHooker())
          } else {
            throw new Error(`Unknown type ${options.type}`)
          }
        }
      } finally {
        reactRoot.render(React.createElement(CreateCustomMatch, { show: false }, null))
      }
    })
  }

  unhook(pimp) {
  }
}
