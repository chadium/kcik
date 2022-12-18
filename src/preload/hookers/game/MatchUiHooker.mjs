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
      killMessage: `
        .game-interface > .ach-cont {
          display: none !important;
        }
      `,
      chat: `
        .desktop-game-interface > .chat {
          display: none !important;
        }
      `,
      chatMessageBox: `
        .messages.messages-cont {
          visibility: hidden !important;
        }
      `,
      time: `
        .state-cont > .left {
          display: none !important;
        }
      `
    }
    this._hide = {}
    this._overrideTab = null
    this._tabState = false
    this._setTabVisible = null
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')
    const vueAppApi = this.pimp.getApi('vueApp')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))

    vueAppApi.on('available', () => {
      // The game seems to call setTabVisible repeatedly when you keep the key
      // pressed. We can do better by only calling our function when the value
      // changes.
      this._setTabVisible = vueAppApi.onMutation('game/setTabVisible', (state) => {
        if (state !== this._tabState) {
          this._tabState = state
          if (this._overrideTab) {
            this._overrideTab(this._tabState)
          }
        }
      })
    })

    return {
      name: 'matchUi',
      api: {
        show: (name, state) => {
          this._hide[name] = !state
          this._reactRoot.render(React.createElement(StyleToggle, this._makeProps(), null))
        },
        getTabState: () => {
          return this._tabState
        },
        overrideTab: (fn) => {
          this._overrideTab = fn
        }
      }
    }
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()

    if (this._setTabVisible !== null) {
      this._setTabVisible.close()
      this._setTabVisible = null
    }
  }

  _makeProps() {
    return {
      styles: this._styles,
      enabled: this._hide,
    }
  }
}
