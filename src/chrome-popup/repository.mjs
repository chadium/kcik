const DEFAULT_FONT_SIZE = 14;

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
}