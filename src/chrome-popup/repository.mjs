const DEFAULT_FONT_SIZE = 14;
const DEFAULT_ENABLE_HOST = true;
const DEFAULT_VOD_KEYBOARD_NAVIGATION = true;

export class Repository {
  #storageArea = null

  constructor(storageArea) {
    this.#storageArea = storageArea
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
}