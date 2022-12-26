const src = chrome.runtime.getURL('preload/index.js')
const s = document.createElement('script')
s.setAttribute('src', src)
document.head.appendChild(s)
