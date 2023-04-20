import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './components/Root.jsx'
import styles from "../preload/global.lazy.css"
import { Com } from './Com.mjs'

styles.use()

chrome.tabs.query({ "active": true, "currentWindow": true }, function(tabs) {
  let port = chrome.tabs.connect(tabs[0].id)

  let com = new Com(port)

  console.log('Render')
  let reactRoot = ReactDOM.createRoot(document.body.appendChild(document.createElement('div')))
  reactRoot.render(React.createElement(Root, { com }))
});
