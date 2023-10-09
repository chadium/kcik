import { Repository } from "../chrome-popup/repository.mjs"
import { PopupCom } from "./PopupCom.mjs"
import { WebsiteCom } from "./WebsiteCom.mjs"
import * as log from "../preload/log.mjs"

class Injection {
  #s = null

  init(initialData) {
    if (this.#s !== null) {
      throw new Error('Already initialized')
    }

    const src = chrome.runtime.getURL('preload/index.js')
    this.#s = document.createElement('script')
    this.#s.setAttribute('src', src)
    this.#s.id = 'kcik'
    this.#s.dataset.message = JSON.stringify(initialData)
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
  log.info('ContentScript', 'KCIK Storage migration start')
  let currentVersion = (await storageArea.get(['version'])).version

  if (currentVersion === undefined) {
    log.info('ContentScript', 'KCIK Storage applying version 1')

    await storageArea.set({
      version: 1
    })

    currentVersion = 1
  }

  log.info('ContentScript', 'KCIK Storage migration end.')
}

async function main() {
  let injection = new Injection()
  let popupCom = new PopupCom()
  let websiteCom = new WebsiteCom(injection)

  await migrate(chrome.storage.sync)
  let repository = new Repository(chrome.storage.sync)

  injection.init({
    websiteTheme: await repository.getWebsiteTheme(),
    fontSize: await repository.getFontSize(),
    enableHost: await repository.getEnableHost(),
    enableVodKeyboardNavigation: await repository.getEnableVodKeyboardNavigation(),
    enableVodMouseVolumeControl: await repository.getEnableVodMouseVolumeControl(),
    enableVodPlaybackSpeed: await repository.getEnableVodPlaybackSpeed(),
    enableVodCurrentTime: await repository.getEnableVodCurrentTime(),
    hideStreamers: await repository.getHideStreamers(),
    chatMessageDeletedMode: await repository.getChatMessageDeletedMode(),
    enableSidebarStreamTooltip: await repository.getEnableSidebarStreamTooltip(),
    enableSendMessageHistory: await repository.getEnableSendMessageHistory(),
  })

  // Forwarding messages.
  popupCom.on('message', (message) => {
    log.info('ContentScript', 'KCIK Forwarding data to website', message)
    websiteCom.send(message.type, message.data)
  })
  websiteCom.on('message', (message) => {
    log.info('ContentScript', 'KCIK Forwarding data to popup', message)
    popupCom.send(message.type, message.data)
  })
}

main().catch((e) => {
  log.bad('ContentScript', e)
})
