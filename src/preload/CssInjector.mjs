export class CssInjector {
  #root = null

  #styleElement = null

  constructor({ root = document.head } = {}) {
    this.#root = root
    this.#styleElement = null;
  }

  setCss(cssCode) {
    if (!this.#styleElement) {
      this.#styleElement = document.createElement('style');
      this.#root.appendChild(this.#styleElement);
    }

    this.#styleElement.textContent = cssCode;
  }

  destroy() {
    if (this.#styleElement) {
      this.#root.removeChild(this.#styleElement);
      this.#styleElement = null;
    }
  }
}