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

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('create-custom-match', async () => {
      try {
        let data = await new Promise((resolve, reject) => {
          const onCreate = (e) => {
            resolve(e)
          }

          const onCancel = () => {
            reject(new Error('Cancelled'))
          }

          reactRoot.render(React.createElement(CreateCustomMatch, { show: true, onCreate, onCancel }, null))
        })
      } finally {
        reactRoot.render(React.createElement(CreateCustomMatch, { show: false }, null))
      }
    })
  }

  unhook(pimp) {
  }
}
