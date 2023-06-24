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

      // Equivalent to: #202225
      let shade2 = colorUtils.adjustBrightness(mainColor, 0.08 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #24272c
      let shade3 = colorUtils.adjustBrightness(mainColor, 0.1 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #3f4448, #374151
      let shade4 = colorUtils.adjustBrightness(mainColor, 0.2 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #474f54
      let shade5 = colorUtils.adjustBrightness(mainColor, 0.25 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

      let textColor = this.#getTextColor(mainColor)

      // Equivalent to: #e5e7eb
      let textColorSubtle = colorUtils.adjustBrightness(textColor, 0.18 * (colorUtils.getLightness(textColor) >= 0.5 ? -1 : 1))

      // Equivalent to: #53fc18
      let complementary = colorUtils.cssColorComplementary(mainColor)

      // Equivalent to: #3ad305
      let complementaryShade = colorUtils.adjustBrightness(complementary, 0.1 * (colorUtils.getLightness(complementary) >= 0.5 ? -1 : 1))

      let complementaryText = this.#getTextColor(complementary)

      let [complementaryHue] = colorUtils.rgbToHsl(complementary)

      return {
        css: `
/* Account menu */
.menu-items {
  color: ${textColor} !important;
  background: ${shade1} !important;
}
.menu-items>:not([hidden])~:not([hidden]) {
  border-color: ${shade4};
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
  border-color: ${shade3} !important;
  background-color: ${shade3} !important;
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
  border-color: ${shade5} !important;
  background: ${shade5} !important;
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
  background: ${shade4} !important;
}
.variant-highlight:hover {
  background: ${shade3} !important;
}

/* Cards */
.card {
  color: ${textColor} !important;
  background: ${shade1} !important;
}

/* Homepage grid cards */
.grid-item.card-content[data-v-44fe15bf]:hover {
  background: ${shade3} !important;
}
.card-session-name:hover,
.card-user-name:hover,
.card-category-name:hover {
  color: ${complementary} !important;
}

/* Stream category */
.category-tags-holder .stream-category {
  color: ${complementary} !important;
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
  background-color: ${shade5} !important;
}
.base-input-layout .input-holder:focus-within {
  border-color: ${shade5};
  background-color: ${mainColor} !important;
}
.base-input-layout input {
  color: ${textColor} !important;
  caret-color: ${shade1} !important;
}

/* Select boxes */
.vue-select .btn-listbox {
  color: ${textColor} !important;
  background-color: ${shade5} !important;
}
.vue-select .btn-listbox:focus {
  border-color: ${shade5} !important;
}
.vue-select .listbox-options {
  background: ${shade1} !important;
}

/* Modview right panel */
.right-panel .divider {
  border-color: ${shade3} !important;
}

/* Modview top bar */
.border-sec .divider {
  background-color: ${shade3} !important;
}

/* Quick emotes */
.quick-emote-item {
  background-color: ${shade3} !important;
}
.quick-emote-item:not(.quick-emote-item-disabled):hover {
  background-color: ${shade5} !important;
}

/* Live indicator in the home page */
.live-tag-component {
  background-color: ${mainColor} !important;
  color: ${complementary} !important;
}

/* Category banner */
.subcategory-card .category-banner:hover {
  filter: sepia(1) hue-rotate(${complementaryHue - 0.15}turn) contrast(1.4) brightness(1) saturate(3)
}

/* Grid */
.see-more .see-more-btn {
  background-color: ${mainColor} !important;
  color: ${textColor} !important;
}

.see-more:after {
  background-color: ${shade3} !important;
}

/* Anything else */
.bg-secondary {
  color: ${textColor};
  background: ${shade1};
}

.bg-secondary-light {
  color: ${textColor};
  background: ${shade2};
}

.bg-secondary-lighter {
  color: ${textColor};
  background: ${shade3};
}
.\\!bg-secondary-lighter {
  color: ${textColor};
  background: ${shade3} !important;
}
.border-secondary-lighter {
  border-color: ${shade3};
}
.border-b-secondary-lighter {
  border-bottom-color: ${shade3};
}
.hover\\:bg-secondary-lighter:hover {
  background: ${shade3};
}

.bg-secondary-lightest {
  background-color: ${shade5};
}
.hover\\:bg-secondary-lightest:hover {
  background-color: ${shade5};
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
  background: ${shade4};
}
.bg-\\[\\#232628\\] {
  color: ${textColor};
  background: ${shade3};
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

.text-gray-400 {
  color: ${textColorSubtle};
}

.text-white {
  color: ${textColor};
}
.hover\\:border-white\\/100:hover {
  border-color: ${textColor};
}

.text-primary {
  color: ${complementary};
}

.hover\\:text-primary:hover {
  color: ${complementary};
}
.sm\\:hover\\:text-primary:hover {
  color: ${complementary};
}
.lg\\:hover\\:text-primary:hover {
  color: ${complementary};
}

.border-primary {
  border-color: ${complementary};
}
.border-primary\\/50 {
  border-color: ${complementary};
}
.\\!border-primary\\/100 {
  border-color: ${complementary} !important;
}

.sm\\:hover\\:text-primary-dark:hover {
  color: ${complementaryShade};
}

.hover\\:bg-primary-dark:hover {
  background-color: ${complementaryShade};
}
`
      }
    } else {
      return {}
    }
  }
}
