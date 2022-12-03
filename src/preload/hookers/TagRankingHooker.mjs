import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import TagRanking from '../components/TagRanking.jsx'
import * as userApi from '../user-api.mjs'
import * as log from '../log.mjs'

export class TagRankingHooker {
  constructor() {
    this._show = false
    this._players = []
    this._it = null
    this._rankingSocket = null
    this._itSocket = null
  }

  hook(pimp) {
    let root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('toggle-score2', () => {
      log.info('TagRanking', 'Toggle score')

      this._show = !this._show

      reactRoot.render(React.createElement(TagRanking, this._makeProps(), null))
    })

    this._rankingSocket = userApi.wsTagRanking({
      onConnect: async () => {
        this._players = await userApi.getTagRanking()
    
        if (this._show) {
          reactRoot.render(React.createElement(TagRanking, this._makeProps(), null))
        }
      },
      onUpdate: ({ ranking }) => {
        this._players = ranking

        if (this._show) {
          reactRoot.render(React.createElement(TagRanking, this._makeProps(), null))
        }
      }
    })

    this._itSocket = userApi.wsTagIt({
      onConnect: async () => {
        this._it = await userApi.tagGetIt()
    
        if (this._show) {
          reactRoot.render(React.createElement(TagRanking, this._makeProps(), null))
        }
      },
      onUpdate: ({ it }) => {
        this._it = it

        if (this._show) {
          reactRoot.render(React.createElement(TagRanking, this._makeProps(), null))
        }
      }
    })
  }

  unhook(pimp) {
    this._rankingSocket.close()
    this._rankingSocket = null
  }

  _makeProps() {
    return { players: this._players, it: this._it, show: this._show }
  }
}
