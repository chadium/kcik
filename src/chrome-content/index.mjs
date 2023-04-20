const src = chrome.runtime.getURL('preload/index.js')
const s = document.createElement('script')
s.setAttribute('src', src)
s.id = 'kcik'
s.dataset.message = ''
document.head.appendChild(s)

let port

chrome.runtime.onConnect.addListener((p) => {
  port = p

  port.onMessage.addListener((message) => {
    console.log('Forwarding data to website', message)
    s.dataset.message = JSON.stringify(message)
    window.postMessage(JSON.stringify(message))
  })

  port.onDisconnect.addListener(() => {
    port = undefined
  })
});

addEventListener('message', (e) => {
  console.log('Content Script received message from window', e.data)

  if (e.origin === 'https://kick.com') {
    if (e.data.type !== undefined) {
      if (port) {
        console.log('Forwarding data to popup', e.data)
        port.postMessage(e.data)
      }
    }
  }
})
