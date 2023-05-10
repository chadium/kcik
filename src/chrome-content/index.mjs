import { Repository } from "../chrome-popup/repository.mjs"
import { PopupCom } from "./PopupCom.mjs"
import { WebsiteCom } from "./WebsiteCom.mjs"

function inject() {
  const src = chrome.runtime.getURL('preload/index.js')
  const s = document.createElement('script')
  s.setAttribute('src', src)
  s.id = 'kcik'
  s.dataset.message = ''
  document.head.appendChild(s)

  return {
    sendMessage(message) {
      s.dataset.message = JSON.stringify(message)
    }
  }
}

async function migrate(storageArea) {
  console.log('KCIK Storage migration start')
  let currentVersion = (await storageArea.get(['version'])).version

  if (currentVersion === undefined) {
    console.log('KCIK Storage applying version 1')

    await storageArea.set({
      version: 1
    })

    currentVersion = 1
  }

  console.log('KCIK Storage migration end.')
}

async function main() {
  let injection = inject()
  await migrate(chrome.storage.sync)
  let repository = new Repository(chrome.storage.sync)

  let popupCom = new PopupCom()
  let websiteCom = new WebsiteCom(injection)

  websiteCom.on('message', async ({ type, data }) => {
    switch (type) {
    case 'kcik.ask':
      for (const field of data.fields) {
        switch (field) {
        case 'fontSize': {
          websiteCom.send('kcik.fontSize', await repository.getFontSize())
          break
        }
        }
      }
      break
    }
  })

  // Forwarding messages.
  popupCom.on('message', (message) => {
    console.log('Forwarding data to website', message)
    websiteCom.send(message.type, message.data)
  })
  websiteCom.on('message', (message) => {
    console.log('Forwarding data to popup', message)
    popupCom.send(message.type, message.data)
  })
}

main().catch(console.error)
