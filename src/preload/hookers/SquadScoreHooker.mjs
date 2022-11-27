import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import SquadScoreApp from '../components/SquadScoreApp.jsx'
import * as userApi from '../user-api.mjs'

export class SquadScoreHooker {
  constructor() {
    this._show = false
    this._squads = []
  }

  hook(pimp) {
    let root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('toggle-score', () => {
      console.log('Toggle score')

      this._show = !this._show

      reactRoot.render(React.createElement(SquadScoreApp, this._makeProps(), null))
    })

    this._refresh()
  }

  unhook(pimp) {
  }

  _makeProps() {
    return { squads: this._squads, show: this._show }
  }

  async _refresh() {
    this._squads = await userApi.getRanking()
  }
}
