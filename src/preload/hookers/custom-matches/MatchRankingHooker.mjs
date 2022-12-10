import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import MatchRanking from '../../components/MatchRanking.jsx'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class MatchRankingHooker {
  constructor() {
    this._show = false
    this._squads = []
    this._socket = null
  }

  hook(pimp) {
    let root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('toggle-score', () => {
      log.info('MatchRanking', 'Toggle score')

      this._show = !this._show

      reactRoot.render(React.createElement(MatchRanking, this._makeProps(), null))
    })

    this._socket = userApi.wsTeamDeathmatchRanking({
      onConnect: async () => {
        this._squads = await userApi.getTeamDeathmatchRanking()
    
        if (this._show) {
          reactRoot.render(React.createElement(MatchRanking, this._makeProps(), null))
        }
      },
      onUpdate: ({ ranking }) => {
        this._squads = ranking

        if (this._show) {
          reactRoot.render(React.createElement(MatchRanking, this._makeProps(), null))
        }
      }
    })
  }

  unhook(pimp) {
    this._socket.close()
    this._socket = null
  }

  _makeProps() {
    return { squads: this._squads, show: this._show }
  }
}
