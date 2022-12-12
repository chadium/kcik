import { Hooker } from '../../Pimp.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import LoadingMod from '../../components/LoadingMod.jsx'
import * as log from '../../log.mjs'

export class LoadingHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
  }

  hook() {
    const vueAppApi = this.pimp.getApi('vueApp')
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    domApi.on('bodyAvailable', () => {
      this._reactRoot.render(React.createElement(LoadingMod, { show: true }, null))

      vueAppApi.on('available', () => {
        this._reactRoot.render(React.createElement(LoadingMod, { show: false }, null))
      })
    })
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()
  }
}
