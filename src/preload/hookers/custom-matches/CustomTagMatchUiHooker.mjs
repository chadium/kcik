import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomTagMatchUi from '../../components/CustomTagMatchUi.jsx'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class CustomTagMatchUiHooker {
  constructor() {
    this._players = []
    this._it = null
    this._rankingSocket = null
    this._itSocket = null
    this._root = null
    this._reactRoot = null
    this._state = null
    this._onStateChange =  ({ state }) => {
      this._state = state
      reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
  }

  hook(pimp) {
    this._root = document.createElement('div')
    this._reactRoot = ReactDOM.createRoot(this._root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(this._root)
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    })

    let customTagMatchApi = pimp.getApi('customTagMatch')

    this._state = customTagMatchApi.getState()
    customTagMatchApi.on('stateChange', this._onStateChange)

    this._rankingSocket = userApi.wsTagRanking({
      onConnect: async () => {
        this._players = await userApi.getTagRanking()
        this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
      },
      onUpdate: ({ ranking }) => {
        this._players = ranking
        this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
      }
    })

    this._itSocket = userApi.wsTagIt({
      onConnect: async () => {
        this._it = await userApi.tagGetIt()
        this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
      },
      onUpdate: ({ it }) => {
        this._it = it
        this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
      }
    })
  }

  unhook(pimp) {
    let customTagMatchApi = pimp.getApi('customTagMatch')
    customTagMatchApi.off('stateChange', this._onStateChange)

    this._rankingSocket.close()
    this._rankingSocket = null

    this._reactRoot.unmount()
    this._root.remove()
  }

  _makeProps() {
    return {
      players: this._players,
      it: this._it,
      state: this._state
    }
  }
}
