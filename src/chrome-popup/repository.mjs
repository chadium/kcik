import Joi from 'joi'

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_ENABLE_HOST = true;
const DEFAULT_VOD_KEYBOARD_NAVIGATION = true;
const DEFAULT_WEBSITE_THEME = null

let websiteThemeSchema = Joi.object({
  mainColor: Joi.string()
    .required(),

  complementaryColor: Joi.string(),
})

export class Repository {
  #storageArea = null

  constructor(storageArea) {
    this.#storageArea = storageArea
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
}