export class StorageV2toV3TranslationLayer {
  #storageArea = null

  constructor(storageArea) {
    this.#storageArea = storageArea
  }

  get(keys) {
    return new Promise((resolve) => this.#storageArea.get(keys, resolve))
  }

  set(obj) {
    return new Promise((resolve) => this.#storageArea.set(obj, resolve))
  }

  remove(keys) {
    return new Promise((resolve) => this.#storageArea.remove(keys, resolve))
  }
}