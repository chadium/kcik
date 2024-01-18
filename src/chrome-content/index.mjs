import { Repository } from "../chrome-popup/repository.mjs"
import { PopupCom } from "./PopupCom.mjs"
import { WebsiteCom } from "./WebsiteCom.mjs"
import { StorageV2toV3TranslationLayer } from "../chrome-popup/StorageV2toV3TranslationLayer.mjs"
import * as log from "../preload/log.mjs"
import { WatchTracker } from "../preload/WatchTracker.mjs"

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
  let watchTracker = new WatchTracker()

  let injection = new Injection()
  let popupCom = new PopupCom({
    onMail(type, data) {
      log.info('ContentScript', 'Got mail from popup', type)

      websiteCom.mail(type, data)
    },
    onRequest(type, data) {
      log.info('ContentScript', 'Got request from popup', type)

      return websiteCom.request(type, data)
    },
  })
  let websiteCom = new WebsiteCom({
    injection,
    onMail(type, data) {
      log.info('ContentScript', 'Got mail from website', type)

      if (type === 'kcik.vod.currentTime.set') {
        watchTracker.track(data.id, data.currentTime, new Date())
        repository.setPlayPositions(watchTracker.save()).catch((e) => {
          log.bad('ContentScript', e)
        })
      } else {
        popupCom.mail(type, data)
      }
    },
    onRequest(type, data) {
      log.info('ContentScript', 'Got request from website', type)

      if (type === 'kcik.vod.currentTime.get') {
        return watchTracker.remember(data.id)
      } else {
        return popupCom.request(type, data)
      }
    },
  })

  const storageArea = new StorageV2toV3TranslationLayer(chrome.storage.sync)

  await migrate(storageArea)
  let repository = new Repository(storageArea)

  watchTracker.load(await repository.getPlayPositions())

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
    enablePlayPositions: await repository.getEnablePlayPositions(),
  })
}

main().catch((e) => {
  log.bad('ContentScript', e)
})
