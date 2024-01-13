import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './components/Root.jsx'
import styles from "../preload/global.lazy.css"
import { ContentCom } from './ContentCom.mjs'
import { Repository } from './repository.mjs'

styles.use()
let reactRoot = ReactDOM.createRoot(document.body.appendChild(document.createElement('div')))

const queryObj = {
  active: true,
  currentWindow: true,
  url: 'https://kick.com/*'
}

chrome.tabs.query(queryObj, async function(tabs) {
  if (tabs.length === 0) {
    reactRoot.render(React.createElement(Root, {
      com: 'on',
      repo: 'garbage',
      error: new Error('You must open this on kick.com')
    }))
    return
  }

  let port = chrome.tabs.connect(tabs[0].id)

  port.onDisconnect.addListener(() => {
    console.error(chrome.runtime.lastError)
    console.log('replace')
    reactRoot.render(React.createElement(Root, {
      com,
      repo: 'garbage',
      error: new Error('Failed to connect to kick.com')
    }))
  })

  let com = new ContentCom(port)
  let repo = new Repository(chrome.storage.sync)

  com.on('error', console.error)

  console.log('render')
  reactRoot.render(React.createElement(Root, { com, repo }))
});
