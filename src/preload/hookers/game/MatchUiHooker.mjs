import { Hooker } from '../../Pimp.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import StyleToggle from '../../components/StyleToggle.jsx'
import * as log from '../../log.mjs'

export class MatchUiHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._styles = {
      tabInfo: `
        .desktop-game-interface > .tab-info {
          display: none !important;
        }
      `,
      killDeathCounter: `
        .desktop-game-interface .kill-death {
          display: none !important;
        }
      `,
      chatInstructions: `
        .desktop-game-interface > .chat > .info {
          display: none !important;
        }
      `,
    }
    this._hide = {}
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))

    return {
      name: 'matchUi',
      api: {
        show: (name, state) => {
          this._hide[name] = !state
          this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))
        }
      }
    }
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()
  }

  _makeProps() {
    return {
      styles: this._styles,
      enabled: this._hide,
    }
  }
}
