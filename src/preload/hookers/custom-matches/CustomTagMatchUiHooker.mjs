import { Hooker } from '../../Pimp.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomTagMatchUi from '../../components/CustomTagMatchUi.jsx'
import { ElapsedServerTime } from '../../elapsed-server-time.mjs'
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
    this._meName = null
    this._showRanking = false
    this._serverTime = null
    this._duration = 0
    this._onMatchPlayersChange = () => {
      log.info('CustomTagMatchUi', 'Match got new players. Will update labels.')
      this._updateLabel()
    }
    this._onTab = (state) => {
      this._showRanking = state
      if (state) {
        let soundApi = this.pimp.getApi('sound')
        soundApi.playSound({ name: 'quickTransitionMini', volume: 0.5 })
      }
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    },
    this._onPlayerAvailable = () => {
      let playerApi = this.pimp.getApi('player')
      this._meName = playerApi.getName()
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
    this._onStateChange = ({ state }) => {
      this._state = state
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
    this._onPlayersChange = (players) => {
      log.info('CustomTagMatchUi', 'Got new players')
      this._players = players
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
    }
    this._onItChange = (it) => {
      this._it = it
      this._updateLabel()
      this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
      if (this._it !== null) {
        pimp.getApi('sound').playSound({ name: "error", volume: 0.75 })
      }
    }
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    let matchApi = this.pimp.getApi('match')
    this._serverTime = matchApi.getServerTime()
    this._duration = matchApi.getDuration()
    matchApi.on('playersChange', this._onMatchPlayersChange)

    let playerApi = this.pimp.getApi('player')
    playerApi.on('available', this._onPlayerAvailable)

    let customTagMatchApi = this.pimp.getApi('customTagMatch')

    this._created = customTagMatchApi.getCreatedTimestamp()

    customTagMatchApi.on('stateChange', this._onStateChange)
    this._state = customTagMatchApi.getState()

    customTagMatchApi.on('playersChange', this._onPlayersChange)
    this._players = customTagMatchApi.getPlayers()

    customTagMatchApi.on('itChange', this._onItChange)
    this._it = customTagMatchApi.getIt()

    let matchUiApi = this.pimp.getApi('matchUi')
    matchUiApi.show('killDeathCounter', false)
    matchUiApi.show('chatInstructions', false)
    matchUiApi.show('tabInfo', false)
    matchUiApi.show('mapName', false)
    matchUiApi.show('inviteAndSpectate', BOOMER_ADMIN)
    matchUiApi.show('killMessage', false)
    matchUiApi.show('chat', false)
    matchUiApi.show('time', false)
    matchUiApi.overrideTab(this._onTab)

    this._updateLabel()
    this._reactRoot.render(React.createElement(CustomTagMatchUi, this._makeProps(), null))
  }

  unhook() {
    let matchUiApi = this.pimp.getApi('matchUi')
    matchUiApi.show('killDeathCounter', true)
    matchUiApi.show('chatInstructions', true)
    matchUiApi.show('tabInfo', true)
    matchUiApi.show('mapName', true)
    matchUiApi.show('inviteAndSpectate', true)
    matchUiApi.show('killMessage', true)
    matchUiApi.show('chat', true)
    matchUiApi.show('true', false)
    matchUiApi.overrideTab(null)

    let customTagMatchApi = this.pimp.getApi('customTagMatch')
    customTagMatchApi.off('stateChange', this._onStateChange)
    customTagMatchApi.off('playersChange', this._onPlayersChange)
    customTagMatchApi.off('itChange', this._onItChange)

    let playerApi = this.pimp.getApi('player')
    playerApi.off('available', this._onPlayerAvailable)

    let matchApi = this.pimp.getApi('match')
    matchApi.off('playersChange', this._onMatchPlayersChange)

    this._reactRoot.unmount()
    this._root.remove()
    this._updateLabel()
  }

  _makeProps() {
    return {
      now: this.pimp.getApi('time').now,
      players: this._players,
      meName: this._meName,
      it: this._it,
      state: this._state,
      created: this._created,
      showRanking: this._showRanking,
      serverTime: this._serverTime,
      duration: this._duration,
    }
  }

  _updateLabel() {
    const playerNameVisibilityApi = this.pimp.getApi('playerNameVisibility')
    playerNameVisibilityApi.clear()

    if (this._it) {
      const playerApi = this.pimp.getApi('player')

      if (this._it.name === playerApi.getName()) {
        // No label to place.
      } else {
        const matchApi = this.pimp.getApi('match')
        let sessionId = matchApi.getSessionIdByName(this._it.name)

        if (sessionId) {
          playerNameVisibilityApi.takeControl(sessionId)
          playerNameVisibilityApi.setVisible(sessionId, true)
          playerNameVisibilityApi.setSeeThrough(sessionId, true)
        } else {
          log.warn('CustomTagMatchUi', `Failed to find sessionId for player ${this._it.name}`)
        }
      }
    }
  }
}
