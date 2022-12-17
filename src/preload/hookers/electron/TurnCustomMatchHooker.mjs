import { Hooker } from '../../Pimp.mjs'
import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import TurnCustomMatch from '../../components/TurnCustomMatch.jsx'
import * as adminApi from '../../admin-api.mjs'
import * as log from '../../log.mjs'

export class TurnCustomMatchHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
  }

  hook() {
    const roomApi = this.pimp.getApi('room')
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    roomApi.on('available', () => {
      ipcRenderer.send('menu.turn-custom-match.visible', true)
    })

    roomApi.on('leave', () => {
      ipcRenderer.send('menu.turn-custom-match.visible', false)
    })

    ipcRenderer.on('menu.turn-custom-match.click', async () => {
      try {
        let options = await new Promise((resolve, reject) => {
          const onCreate = (e) => {
            resolve(e)
          }

          const onCancel = () => {
            reject(new Error('Cancelled'))
          }

          this._reactRoot.render(React.createElement(TurnCustomMatch, { show: true, onCreate, onCancel }, null))
        })

        let { roomId, regionId } = roomApi.getRoomIdentification()

        log.info('TurnCustomMatch', `Creating custom match in room ${roomId}`)
        await adminApi.matchSet(regionId, roomId, options.type)
      } finally {
        this._reactRoot.render(React.createElement(TurnCustomMatch, { show: false }, null))
      }
    })

    const customMatchMDetectorApi = this.pimp.getApi('customMatchMDetector')
    customMatchMDetectorApi.on('isPlayingCustomMatch', () => {
      this._updateCustomMatch()
    })

    ipcRenderer.on('menu.end-custom-match.click', async () => {
      await adminApi.matchEnd()
    })

    this._updateCustomMatch()
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()

    throw new Error('TODO')
  }

  _updateCustomMatch() {
    const roomApi = this.pimp.getApi('room')

    if (roomApi.isInRoom()) {
      const customMatchMDetectorApi = this.pimp.getApi('customMatchMDetector')
      const isPlayingCustomMatch = customMatchMDetectorApi.isPlayingCustomMatch()

      ipcRenderer.send('menu.end-custom-match.visible', isPlayingCustomMatch)
      ipcRenderer.send('menu.turn-custom-match.visible', !isPlayingCustomMatch)
    } else {
      ipcRenderer.send('menu.end-custom-match.visible', false)
      ipcRenderer.send('menu.turn-custom-match.visible', false)
    }
  }
}
