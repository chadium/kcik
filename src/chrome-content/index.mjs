import { Repository } from "../chrome-popup/repository.mjs"
import { PopupCom } from "./PopupCom.mjs"
import { WebsiteCom } from "./WebsiteCom.mjs"

class Injection {
  #s = null

  init() {
    if (this.#s !== null) {
      throw new Error('Already initialized')
    }

    const src = chrome.runtime.getURL('preload/index.js')
    this.#s = document.createElement('script')
    this.#s.setAttribute('src', src)
    this.#s.id = 'kcik'
    this.#s.dataset.message = ''
    document.head.appendChild(this.#s)
  }

  sendMessage(message) {
    if (this.#s === null) {
      throw new Error('Need to initialize')
    }

    this.#s.dataset.message = JSON.stringify(message)
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
  let injection = new Injection()
  let popupCom = new PopupCom()
  let websiteCom = new WebsiteCom(injection)

  injection.init()

  await migrate(chrome.storage.sync)
  let repository = new Repository(chrome.storage.sync)

  websiteCom.on('message', async ({ type, data }) => {
    switch (type) {
    case 'kcik.ask':
      for (const field of data.fields) {
        switch (field) {
        case 'fontSize': {
          websiteCom.send('kcik.fontSize', await repository.getFontSize())
          break
        }
        case 'enableHost': {
          websiteCom.send('kcik.enableHost', await repository.getEnableHost())
          break
        }
        case 'enableVodKeyboardNavigation': {
          websiteCom.send('kcik.enableVodKeyboardNavigation', await repository.getEnableVodKeyboardNavigation())
          break
        }
        case 'websiteTheme': {
          websiteCom.send('kcik.websiteTheme', await repository.getWebsiteTheme())
          break
        }
        }
      }
      break
    }
  })

  // Forwarding messages.
  popupCom.on('message', (message) => {
    console.log('KCIK Forwarding data to website', message)
    websiteCom.send(message.type, message.data)
  })
  websiteCom.on('message', (message) => {
    console.log('KCIK Forwarding data to popup', message)
    popupCom.send(message.type, message.data)
  })
}

main().catch((e) => {
  console.error('KCIK', e)
})
