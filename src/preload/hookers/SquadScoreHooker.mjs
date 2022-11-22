import { ipcRenderer } from 'electron'
import React from 'react'
import ReactDOM from 'react-dom/client'
import SquadScoreApp from '../components/SquadScoreApp.jsx'

export class SquadScoreHooker {
  constructor() {
    this._show = false
    this._squads = [
      {
        name: 'red',
        color: '#e70000',
        members: [
          {
            name: 'Newbie#8',
            kills: 1,
            deaths: 2,
            score: 100
          },
          {
            name: 'Newbie#7',
            kills: 0,
            deaths: 1,
            score: 0
          },
        ]
      },
      {
        name: 'blue',
        color: '#0000b3',
        members: [
          {
            name: 'Newbie#1',
            kills: 0,
            deaths: 0,
            score: 0
          },
          {
            name: 'Newbie#2',
            kills: 0,
            deaths: 3,
            score: 0
          },
        ]
      },
      {
        name: 'yellow',
        color: '#a9a900',
        members: [
          {
            name: 'Newbie#3',
            kills: 1,
            deaths: 0,
            score: 50
          },
          {
            name: 'Newbie#4',
            kills: 1,
            deaths: 0,
            score: 50
          },
        ]
      }
      ,
      {
        name: 'green',
        color: '#057e05',
        members: [
          {
            name: 'Newbie#5',
            kills: 0,
            deaths: 1,
            score: 0
          },
          {
            name: 'Newbie#6',
            kills: 0,
            deaths: 0,
            score: 0
          },
        ]
      }
    ]
  }

  hook(pimp) {
    let root = document.createElement('div')
    const reactRoot = ReactDOM.createRoot(root)

    addEventListener('DOMContentLoaded', (event) => {
      document.body.append(root)
    })

    ipcRenderer.on('toggle-score', () => {
      console.log('Toggle score')

      this._show = !this._show

      reactRoot.render(React.createElement(SquadScoreApp, this._makeProps(), null))
    })
  }

  unhook(pimp) {
  }

  _makeProps() {
    return { squads: this._squads, show: this._show }
  }
}
