import { Hooker } from '../../Pimp.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomTagMatchUi from '../../components/CustomTagMatchUi.jsx'
import * as userApi from '../../user-api.mjs'
import * as log from '../../log.mjs'

export class CustomTagMatchUiHooker extends Hooker {
  constructor() {
    super()
    this._players = []
    this._it = null
    this._root = null
    this._reactRoot = null
    this._state = null
    this._created = null
    this._onStateChange = ({ state }) => {
      this._state = state
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
    this._onPlayersChange = (players) => {
      this._players = players
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
    this._onItChange = (it) => {
      this._it = it
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    let customTagMatchApi = this.pimp.getApi('customTagMatch')

    this._created = customTagMatchApi.getCreatedTimestamp()
    this._state = await customTagMatchApi.getState()
    customTagMatchApi.on('stateChange', this._onStateChange)
    customTagMatchApi.on('playersChange', this._onPlayersChange)
    customTagMatchApi.on('itChange', this._onItChange)

    this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
  }

  unhook() {
    let customTagMatchApi = this.pimp.getApi('customTagMatch')
    customTagMatchApi.off('stateChange', this._onStateChange)
    customTagMatchApi.off('playersChange', this._onPlayersChange)
    customTagMatchApi.off('itChange', this._onItChange)

    this._reactRoot.unmount()
    this._root.remove()
  }

  _makeProps() {
    return {
      players: this._players,
      it: this._it,
      state: this._state,
      created: this._created
    }
  }
}
