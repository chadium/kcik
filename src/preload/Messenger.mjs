import React from 'react'
import ReactDOM from 'react-dom/client'
import MessageDialog from '../chrome-popup/components/MessageDialog.jsx'

export class Messenger {
  constructor(root) {
    this._reactRoot = ReactDOM.createRoot(root)
  }

  async prompt({ title, message }) {
    return new Promise((resolve, reject) => {
      let buttons = [
        {
          text: 'OK',
          action: 'accept'
        }
      ]

      const onAccept = (e) => {
        this._reactRoot.render(React.createElement(MessageDialog, { show: false }, null))
        resolve(e)
      }

      const onReject = (e) => {
        this._reactRoot.render(React.createElement(MessageDialog, { show: false }, null))
        resolve(e)
      }

      this._reactRoot.render(React.createElement(MessageDialog, { show: true, title, message, onAccept, onReject }, null))
    })
  }
}
