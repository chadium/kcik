import { Hooker } from '../../Pimp.mjs'
import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import MatchRanking from '../../components/MatchRanking.jsx'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class MatchRankingHooker extends Hooker {
  constructor() {
    super()
    this._show = false
    this._squads = []
    this._socket = null
    this._root = null
    this._reactRoot = null
  }

  hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

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

  unhook() {
    this._socket.close()
    this._socket = null

    this._reactRoot.unmount()
    this._root.remove()
  }

  _makeProps() {
    return { squads: this._squads, show: this._show }
  }
}
