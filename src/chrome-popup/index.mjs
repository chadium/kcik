import React from 'react'
import ReactDOM from 'react-dom/client'
import Root from './components/Root.jsx'

let reactRoot = ReactDOM.createRoot(document.body.appendChild(document.createElement('div')))
reactRoot.render(React.createElement(Root))
