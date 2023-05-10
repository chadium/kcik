import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Style from '../../../chrome-popup/components/Style.jsx'

export class FontSizeHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._size = 14

    this._fontSizeHandler = (message) => {
      if (message.type === 'kcik.fontSize') {
        this.#setSize(message.data)
      }
    }
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')
    const chromeExtensionApi = this.pimp.getApi('chromeExtension')

    chromeExtensionApi.on('message', this._fontSizeHandler)

    chromeExtensionApi.send('kcik.ask', {
      fields: ['fontSize']
    })

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(Style, this.#makeProps(), null))

    return {
      name: 'fontSize',
      api: {
        getSize: () => {
          return this._size
        }
      }
    }
  }

  unhook() {
    chromeExtensionApi.off('message', this._fontSizeHandler)
    this._reactRoot.unmount()
    this._root.remove()
  }

  #makeProps() {
    return {
      css: `
.chat-entry {
  font-size: ${this._size}px;
  line-height: 1.25em;
}
`
    }
  }

  #setSize(size) {
    this._size = size
    this._reactRoot.render(React.createElement(Style, this.#makeProps(), null))
  }
}
