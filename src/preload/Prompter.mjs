import React from 'react'
import ReactDOM from 'react-dom/client'
import Prompt from '../chrome-popup/components/Prompt.jsx'

export class PrompterCancelError extends Error {
  constructor() {
    super("Cancelled")
    this.name = this.constructor.name
  }
}

export class Prompter {
  constructor(root) {
    this._reactRoot = ReactDOM.createRoot(root)
  }

  async prompt({ title, placeholder, buttons }) {
    return new Promise((resolve, reject) => {
      const onEnter = (e) => {
        this._reactRoot.render(React.createElement(Prompt, { show: false }, null))
        resolve(e)
      }

      const onCancel = () => {
        this._reactRoot.render(React.createElement(Prompt, { show: false }, null))
        reject(new PrompterCancelError())
      }

      this._reactRoot.render(React.createElement(Prompt, { show: true, title, placeholder, buttons, onEnter, onCancel }, null))
    })
  }
}
