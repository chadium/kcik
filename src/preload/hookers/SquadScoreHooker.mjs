import React from 'react'
import ReactDOM from 'react-dom/client'
import SquadScoreApp from '../components/SquadScoreApp.jsx'

export class SquadScoreHooker {
  constructor() {
  }

  hook(pimp) {
    let root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)

      reactRoot.render(React.createElement(SquadScoreApp, {}, null))
    })
  }

  unhook(pimp) {
  }
}
