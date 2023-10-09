import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { CssInjector } from '../../CssInjector.mjs'

export class FontSizeHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._size = null
    this._css = null
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()

    this._css = new CssInjector({ root: this._root })

    return {
      name: 'fontSize',
      api: {
        setSize: (size) => {
          this._size = size
          this._css.setCss(this.#makeCss())
        }
      }
    }
  }

  unhook() {
    this._css.destroy()
    this._root.remove()
  }

  #makeCss() {
    if (this._size === null) {
      // Got nothing.
      return ''
    }

    return `
.chat-entry {
  font-size: ${this._size}px;
  line-height: 1.25em;
}
`
  }
}
