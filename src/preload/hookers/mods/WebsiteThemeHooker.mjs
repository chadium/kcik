import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Style from '../../../chrome-popup/components/Style.jsx'
import * as colorUtils from '../../color-utils.mjs'

export class WebsiteThemeHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._websiteTheme = null
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')
    const chromeExtensionApi = this.pimp.getApi('chromeExtension')

    chromeExtensionApi.send('kcik.ask', {
      fields: ['websiteTheme']
    })

    this._root = domApi.addElement()
    this._reactRoot = ReactDOM.createRoot(this._root)

    this._reactRoot.render(React.createElement(Style, this.#makeProps(), null))

    return {
      name: 'websiteTheme',
      api: {
        getWebsiteTheme: () => {
          return this._websiteTheme
        },

        setWebsiteTheme: (websiteTheme) => {
          this._websiteTheme = websiteTheme
          this._reactRoot.render(React.createElement(Style, this.#makeProps(), null))
        }
      }
    }
  }

  unhook() {
    this._reactRoot.unmount()
    this._root.remove()
  }

  #getTextColor(color) {
    return colorUtils.getLightness(color) >= 0.5 ? '#232323' : '#ffffff'
  }

  #makeProps() {
    if (this._websiteTheme) {
      // Equivalent to: #0b0e0f
      let mainColor = this._websiteTheme.mainColor

      // Equivalent to: #191b1f
      let shade1 = colorUtils.adjustBrightness(mainColor, 0.06 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #24272c
      let shade2 = colorUtils.adjustBrightness(mainColor, 0.1 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #3f4448
      let shade3 = colorUtils.adjustBrightness(mainColor, 0.2 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #474f54
      let shade4 = colorUtils.adjustBrightness(mainColor, 0.25 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      let textColor = this.#getTextColor(mainColor)

      // Equivalent to: #e5e7eb
      debugger
      let textColorSubtle = colorUtils.adjustBrightness(textColor, 0.1 * (colorUtils.getLightness(textColor) >= 0.5 ? -1 : 1))

      console.log(textColorSubtle, '#e5e7eb')

      let complementary = colorUtils.cssColorComplementary(mainColor)
      let complementaryShade = colorUtils.adjustBrightness(complementary, 0.1 * (colorUtils.getLightness(complementary) >= 0.5 ? -1 : 1))
      let complementaryText = this.#getTextColor(complementary)

      return {
        css: `
/* Account menu */
.menu-items {
  color: ${textColor} !important;
  background: ${shade1} !important;
}

/* Chat */
.chat-entry-username {
  text-shadow: 0 1px 0px black, 1px 0px 0px black;
  text-shadow: 1px 1px 0px rgba(0,0,0,0.5);
}
.chatroom-footer {
  color: ${textColor};
  background: ${shade1} !important;
}

/* Text mode editor (used in chat) */
.text-mode {
  color: ${textColor} !important;
  border-color: ${shade2} !important;
  background-color: ${shade2} !important;
}
.text-mode:focus-within {
  background-color: ${shade1} !important;
}

/* Search input */
.dark #search-input {
  color: ${textColor} !important;
  caret-color: ${textColor} !important;
  background: ${shade1} !important;
  border-color: ${mainColor} !important;
}
.dark #search-input:hover {
  border-color: ${shade4} !important;
  background: ${shade4} !important;
}

/* Search results */
.results .hit:hover {
  background: ${shade1} !important;
}

/* Sidebar */
.sidebar {
  color: ${textColor};
  background: ${shade1} !important;
}
.sidebar-item {
  color: ${textColor};
  background: ${shade1} !important;
}
.sidebar-item .item-name {
  color: ${textColor};
}

/* Buttons */
.variant-action {
  color: ${complementaryText} !important;
  background: ${complementary} !important;
}
.variant-action:hover {
  background: ${complementaryShade} !important;
}
.variant-highlight {
  color: ${textColor} !important;
  fill: ${textColor} !important;
  background: ${shade3} !important;
}
.variant-highlight:hover {
  background: ${shade2} !important;
}

/* Cards */
.card {
  color: ${textColor} !important;
  background: ${shade1} !important;
}

/* Stream category */
.category-tags-holder .stream-category {
  color: ${complementary} !important;
}

/* Profile status */
.avatar-live-tag {
  color: ${complementaryText} !important;
  background: ${complementary} !important;
}

/* Stream Tags */
.category-tag-component {
  color: ${textColor} !important;
  background: ${shade1} !important;
}

/* Radio */
.radio-container input:checked {
  border-color: ${complementary} !important;
  background-color: black !important;
}
.radio-container input:checked:before {
  background-color: ${complementary} !important;
}

/* Text input box */
.base-input-layout .input-holder {
  background-color: ${shade4} !important;
}
.base-input-layout .input-holder:focus-within {
  border-color: ${shade4};
  background-color: ${mainColor} !important;
}
.base-input-layout input {
  color: ${textColor} !important;
  caret-color: ${shade1} !important;
}

/* Select boxes */
.vue-select .btn-listbox {
  color: ${textColor} !important;
  background-color: ${shade4} !important;
}

/* Anything else */
.bg-secondary-light {
  color: ${textColor};
  background: ${shade1};
}

.bg-secondary-lighter {
  color: ${textColor};
  background: ${shade2};
}
.border-secondary-lighter {
  border-color: ${shade2};
}
.border-b-secondary-lighter {
  border-bottom-color: ${shade2};
}

.bg-secondary-dark {
  color: ${textColor};
  background: ${mainColor};
}
.bg-gray-900 {
  color: ${textColor};
  background: ${mainColor};
}

/* Oh yes, they did. */
.bg-\\[\\#171C1E\\] {
  background: ${shade1};
}
.bg-\\[\\#3F4448\\] {
  background: ${shade3};
}
.bg-\\[\\#232628\\] {
  color: ${textColor};
  background: ${shade2};
}
.\\!border-primary {
  border-color: ${complementary} !important;
}
.bg-primary {
  background: ${complementary};
}

/* Weird, I know but looks good. */
.bg-black {
  background: ${mainColor};
}
`
      }
    } else {
      return {}
    }
  }
}
