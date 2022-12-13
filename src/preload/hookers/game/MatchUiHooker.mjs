import { Hooker } from '../../Pimp.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import StyleToggle from '../../components/StyleToggle.jsx'
import { overrideMutation } from '../../vuex-utils.mjs'
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
      mapName: `
        .desktop-game-interface > .mini-map-cont {
          display: none !important;
        }
      `,
      inviteAndSpectate: `
        .esc-interface .invite2 {
          display: none !important;
        }
      `,
    }
    this._hide = {}
    this._overrideTab = null
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')
    const vueAppApi = this.pimp.getApi('vueApp')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))

    return {
      name: 'matchUi',
      api: {
        show: (name, state) => {
          this._hide[name] = !state
          this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))
        },
        overrideTab: (fn) => {
          if (this._overrideTab !== null) {
            this._overrideTab.close()
          }

          if (fn === null) {
            return
          }

          this._overrideTab = overrideMutation(vueAppApi.getVueApp().$store, 'game/setTabVisible', fn)
        }
      }
    }
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()

    if (this._overrideTab !== null) {
      this._overrideTab.close()
    }
  }

  _makeProps() {
    return {
      styles: this._styles,
      enabled: this._hide,
    }
  }
}
