import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Style from '../../components/Style.jsx'

export class FontSizeHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._size = 14
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(Style, this._makeProps(), null))

    return {
      name: 'fontSize',
      api: {
        getSize: () => {
          return this._size
        },

        setSize: (size) => {
          this._size = size
          this._reactRoot.render(React.createElement(Style, this._makeProps(), null))
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
      css: `
.chat-entry {
  font-size: ${this._size}px;
  line-height: 1.25em;
}
`
    }
  }
}
