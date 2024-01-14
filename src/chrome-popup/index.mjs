import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './components/Root.jsx'
import styles from "../preload/global.lazy.css"
import { ContentCom } from './ContentCom.mjs'
import { Repository } from './repository.mjs'
import { StorageV2toV3TranslationLayer } from './StorageV2toV3TranslationLayer.mjs'

styles.use()
let reactRoot = ReactDOM.createRoot(document.body.appendChild(document.createElement('div')))
reactRoot.render(React.createElement(Root, { loading: true }))

const queryObj = {
  active: true,
  currentWindow: true,
}

chrome.tabs.query(queryObj, async function(tabs) {
  if (tabs.length === 0) {
    reactRoot.render(React.createElement(Root, {
      com: 'on',
      repo: 'garbage',
      error: new Error('To use this extension, you need to open this on kick.com')
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

  const storageArea = new StorageV2toV3TranslationLayer(chrome.storage.sync)

  let com = new ContentCom(port)
  let repo = new Repository(storageArea)

  com.on('error', console.error)

  console.log('render')
  reactRoot.render(React.createElement(Root, { com, repo }))
});
