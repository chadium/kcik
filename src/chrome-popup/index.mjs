import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './components/Root.jsx'
import styles from "../preload/global.lazy.css"
import { ContentCom } from './ContentCom.mjs'
import { Repository } from './repository.mjs'

styles.use()
let reactRoot = ReactDOM.createRoot(document.body.appendChild(document.createElement('div')))

chrome.tabs.query({ "active": true, "currentWindow": true }, async function(tabs) {
  let port = chrome.tabs.connect(tabs[0].id)

  port.onDisconnect.addListener(() => {
    console.error(chrome.runtime.lastError)
    console.log('replace')
    reactRoot.render(React.createElement(Root, {
      com,
      repo: 'garbage',
      error: chrome.runtime.lastError
    }))
  })

  let com = new ContentCom(port)
  let repo = new Repository(chrome.storage.sync)

  com.on('error', console.error)

  console.log('render')
  reactRoot.render(React.createElement(Root, { com, repo }))
});
