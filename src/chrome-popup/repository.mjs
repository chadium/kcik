import Joi from 'joi'

export const chatMessageDeletedMode = {
  DEFAULT: 0,
  SHOW_MESSAGE: 1
}

const DEFAULT_FONT_SIZE = 14
const DEFAULT_ENABLE_HOST = true
const DEFAULT_VOD_KEYBOARD_NAVIGATION = true
const DEFAULT_VOD_MOUSE_VOLUME_CONTROL = false
const DEFAULT_VOD_PLAYBACK_SPEED = true
const DEFAULT_VOD_CURRENT_TIME = true
const DEFAULT_WEBSITE_THEME = null
const DEFAULT_CHAT_MESSAGE_DELETED_MODE = chatMessageDeletedMode.DEFAULT
const DEFAULT_SIDEBAR_STREAM_TOOLTIP = true
const DEFAULT_SEND_MESSAGE_HISTORY = true

let websiteThemeSchema = Joi.object({
  mainColor: Joi.string()
    .required(),

  complementaryColor: Joi.string(),
})

let hideStreamersSchema = Joi.object({
  featured: Joi.array().items(Joi.string()).required()
})

export class Repository {
  #storageArea = null

  constructor(storageArea) {
    this.#storageArea = storageArea
  }

  async getEnableSendMessageHistory() {
    let result = await this.#storageArea.get(['enableSendMessageHistory'])

    if (result.enableSendMessageHistory === undefined) {
      return DEFAULT_SEND_MESSAGE_HISTORY
    }

    return result.enableSendMessageHistory
  }

  async setEnableSendMessageHistory(value) {
    if (value === DEFAULT_SEND_MESSAGE_HISTORY) {
      await this.#storageArea.remove(['enableSendMessageHistory'])
    } else {
      await this.#storageArea.set({
        enableSendMessageHistory: value
      })
    }
  }

  async getEnableSidebarStreamTooltip() {
    let result = await this.#storageArea.get(['enableSidebarStreamTooltip'])

    if (result.enableSidebarStreamTooltip === undefined) {
      return DEFAULT_SIDEBAR_STREAM_TOOLTIP
    }

    return result.enableSidebarStreamTooltip
  }

  async setEnableSidebarStreamTooltip(value) {
    if (value === DEFAULT_SIDEBAR_STREAM_TOOLTIP) {
      await this.#storageArea.remove(['enableSidebarStreamTooltip'])
    } else {
      await this.#storageArea.set({
        enableSidebarStreamTooltip: value
      })
    }
  }

  async getChatMessageDeletedMode() {
    let result = await this.#storageArea.get(['chatMessageDeletedMode'])

    if (result.chatMessageDeletedMode === undefined) {
      return DEFAULT_CHAT_MESSAGE_DELETED_MODE
    }

    return result.chatMessageDeletedMode
  }

  async setChatMessageDeletedMode(value) {
    if (value === DEFAULT_CHAT_MESSAGE_DELETED_MODE) {
      await this.#storageArea.remove(['chatMessageDeletedMode'])
    } else {
      await this.#storageArea.set({
        chatMessageDeletedMode: value
      })
    }
  }

  async getWebsiteTheme() {
    let result = await this.#storageArea.get(['websiteTheme'])

    if (result.websiteTheme === undefined) {
      return DEFAULT_WEBSITE_THEME
    }

    return result.websiteTheme
  }

  async setWebsiteTheme(value) {
    if (value === DEFAULT_WEBSITE_THEME) {
      await this.#storageArea.remove(['websiteTheme'])
    } else {
      value = await websiteThemeSchema.validateAsync(value)

      await this.#storageArea.set({
        websiteTheme: value
      })
    }
  }

  async getFontSize() {
    let result = await this.#storageArea.get(['fontSize'])

    if (result.fontSize === undefined) {
      return DEFAULT_FONT_SIZE
    }

    return result.fontSize
  }

  async setFontSize(value) {
    if (value === DEFAULT_FONT_SIZE) {
      await this.#storageArea.remove(['fontSize'])
    } else {
      await this.#storageArea.set({
        fontSize: value
      })
    }
  }

  async getEnableHost() {
    let result = await this.#storageArea.get(['enableHost'])

    if (result.enableHost === undefined) {
      return DEFAULT_ENABLE_HOST
    }

    return result.enableHost
  }

  async setEnableHost(value) {
    if (value === DEFAULT_ENABLE_HOST) {
      await this.#storageArea.remove(['enableHost'])
    } else {
      await this.#storageArea.set({
        enableHost: value
      })
    }
  }

  async getEnableVodKeyboardNavigation() {
    let result = await this.#storageArea.get(['enableVodKeyboardNavigation'])

    if (result.enableVodKeyboardNavigation === undefined) {
      return DEFAULT_VOD_KEYBOARD_NAVIGATION
    }

    return result.enableVodKeyboardNavigation
  }

  async setEnableVodKeyboardNavigation(value) {
    if (value === DEFAULT_VOD_KEYBOARD_NAVIGATION) {
      await this.#storageArea.remove(['enableVodKeyboardNavigation'])
    } else {
      await this.#storageArea.set({
        enableVodKeyboardNavigation: value
      })
    }
  }

  async getEnableVodMouseVolumeControl() {
    let result = await this.#storageArea.get(['enableVodMouseVolumeControl'])

    if (result.enableVodMouseVolumeControl === undefined) {
      return DEFAULT_VOD_MOUSE_VOLUME_CONTROL
    }

    return result.enableVodMouseVolumeControl
  }

  async setEnableVodMouseVolumeControl(value) {
    if (value === DEFAULT_VOD_MOUSE_VOLUME_CONTROL) {
      await this.#storageArea.remove(['enableVodMouseVolumeControl'])
    } else {
      await this.#storageArea.set({
        enableVodMouseVolumeControl: value
      })
    }
  }

  async getEnableVodPlaybackSpeed() {
    let result = await this.#storageArea.get(['enableVodPlaybackSpeed'])

    if (result.enableVodPlaybackSpeed === undefined) {
      return DEFAULT_VOD_PLAYBACK_SPEED
    }

    return result.enableVodPlaybackSpeed
  }

  async setEnableVodPlaybackSpeed(value) {
    if (value === DEFAULT_VOD_PLAYBACK_SPEED) {
      await this.#storageArea.remove(['enableVodPlaybackSpeed'])
    } else {
      await this.#storageArea.set({
        enableVodPlaybackSpeed: value
      })
    }
  }

  async getEnableVodCurrentTime() {
    let result = await this.#storageArea.get(['enableVodCurrentTime'])

    if (result.enableVodCurrentTime === undefined) {
      return DEFAULT_VOD_CURRENT_TIME
    }

    return result.enableVodCurrentTime
  }

  async setEnableVodCurrentTime(value) {
    if (value === DEFAULT_VOD_CURRENT_TIME) {
      await this.#storageArea.remove(['enableVodCurrentTime'])
    } else {
      await this.#storageArea.set({
        enableVodCurrentTime: value
      })
    }
  }

  async getHideStreamers() {
    let result = await this.#storageArea.get(['hideStreamers'])

    if (result.hideStreamers === undefined) {
      result.hideStreamers = {}
    }

    if (result.hideStreamers.featured === undefined) {
      result.hideStreamers.featured = []
    }

    return result.hideStreamers
  }

  async setHideStreamers(value) {
    value = await hideStreamersSchema.validateAsync(value)

    if (value.featured.length === 0) {
      delete value.featured
    }

    if (Object.keys(value).length === 0) {
      // Naughty list is empty.
      await this.#storageArea.remove(['hideStreamers'])
    }

    await this.#storageArea.set({
      hideStreamers: value
    })
  }
}