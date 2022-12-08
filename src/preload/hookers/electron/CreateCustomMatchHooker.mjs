import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CreateCustomMatch from '../../components/CreateCustomMatch.jsx'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class CreateCustomMatchHooker {
  constructor() {
  }

  hook(pimp) {
    const root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    const vueAppApi = pimp.getApi('vueApp')

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

        options.kirkaOptions.applyToKirkaGame(gameObject)
      } finally {
        reactRoot.render(React.createElement(CreateCustomMatch, { show: false }, null))
      }
    })
  }

  unhook(pimp) {
  }
}
