import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import * as colorUtils from '../../color-utils.mjs'
import { websiteThemeValues } from '../../website-theme.mjs'
import { CssInjector } from '../../CssInjector.mjs'

export class WebsiteThemeHooker extends Hooker {
  constructor() {
    super()
    this._root = null
    this._reactRoot = null
    this._websiteTheme = null
    this._css = null
  }

  async hook() {
    const domApi = this.pimp.getApi('dom')

    this._root = domApi.addElement()

    this._css = new CssInjector({ root: this._root })

    return {
      name: 'websiteTheme',
      api: {
        getWebsiteTheme: () => {
          return this._websiteTheme
        },

        setWebsiteTheme: (websiteTheme) => {
          this._websiteTheme = websiteTheme
          this._css.setCss(this.#makeCss())
        }
      }
    }
  }

  unhook() {
    this._root.remove()
  }

  #makeCss() {
    if (this._websiteTheme) {
      let {
        mainColor,
        shade1,
        shade2,
        shade3,
        shade4,
        shade5,
        shade6,
        shade7,
        shade8,
        textColor,
        textColorShade1,
        textColorShade2,
        textColorShade3,
        textColorShade4,
        textColorShade5,
        textColorShade6,
        textColorShade7,
        complementary,
        complementaryShade1,
        complementaryShade2,
        complementaryShade3,
        complementaryText,
      } = websiteThemeValues(this._websiteTheme)

      let [complementaryHue] = colorUtils.rgbToHsl(complementary)

      // Note: I use html[lang] to increase specifity.
      return `
:root {
  --toastify-color-dark: ${mainColor};
  --toastify-text-color-dark: ${textColor};
}

/* Kick logo */
.main-navbar svg path {
  fill: ${textColor};
}

/* Kick logo in the footer */
footer svg path {
  fill: ${textColor};
}

/* Toast card */
.toast-card {
  color: ${complementaryText} !important;
  background: ${complementaryShade2} !important;
}

/* Account menu */
.menu-items {
  color: ${textColor} !important;
  background: ${shade1} !important;
}
.menu-items>:not([hidden])~:not([hidden]) {
  border-color: ${shade5};
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
.chat-message-identity:hover {
  background: ${shade6} !important;
}
.chat-actions-popup {
  background: ${shade1} !important;
}
.chat-actions-item:hover {
  background: ${shade6}99 !important;
}
.actions-muted-count {
  color: ${textColorShade5} !important;
}
.chatroom-identity .preview {
  background: ${mainColor} !important;
}
.chatroom-identity .divider {
  background: ${shade4} !important;
}
.chatroom-identity .badges-container .badge.bordered,
.chatroom-identity .badges-container .badge.bordered {
  outline-color: ${complementary} !important;
}
.chatroom-identity .labels .subtitle {
  color: ${textColorShade4} !important;
}
.chatroom-identity .settings .global-badges .labels .title .suffix {
  color: ${shade8} !important;
}
.chatroom-event-host__container,
.chatroom-event-ban__container,
.chatroom-event-unban__container {
  background: ${shade3} !important;
}
.chatroom-event-ban__container .chatroom-event-ban__icon,
.chatroom-event-unban__container .chatroom-event-unban__icon {
  color: ${complementary} !important;
}
.chatroom-event-sub__icon,
.chatroom-event-host__icon {
  color: ${complementary} !important;
}
#chatroom-top svg path[fill=white] {
  fill: ${textColor};
}
.chatroom-identity .color-item.selected {
  --tw-ring-color: ${complementary} !important;
}
.chat-entry-clip {
  background: ${shade1} !important;
}
.chat-entry-clip .chat-entry-clip-info .clipped-by {
  /* todo */
  color: #fff6 !important;
}
.chatroom-banner {
  background: ${complementary} !important;
  color: ${complementaryText} !important;
}
.chatroom-banner .banner-icon {
  color: ${complementaryText} !important;
}
.sliding-div-holder:before {
  /* First seen in the chatroom banner. */
  background: linear-gradient(to right, ${complementary}, transparent 1%, transparent 99%, ${complementary} 100%) !important;
}
.chatroom-event-sub__container {
  background: ${shade3} !important
}
.chatroom-event-sub__label {
  color: ${textColorShade3} !important;
}
.pinned-message__container {
  background: ${shade3} !important;
}
.chatroom-history-breaker {
  color: ${complementary} !important;
}
.chatroom-history-breaker div {
  background: ${complementary} !important;
}
.chatroom-identity .settings .global-badges .badges-container .no-data,
.chatroom-identity .settings .channel-badges .badges-container .no-data,
.chatroom-identity .settings .colors .badges-container .no-data {
  color: ${textColor} !important;
}

/* Seen in a vod page */
.chat-container {
  border-color: ${shade2} !important;
}

/* Gifted subs in chat */
.chatroom-event-subgift__container {
  background-color: ${shade3} !important;
}
.chatroom-event-subgift__container .chatroom-event-subgift__icon {
  color: ${textColor} !important;
}
.chatroom-event-subgift__container .chatroom-event-subgift__label {
  color: ${textColorShade3} !important;
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
html[lang] #search-input {
  color: ${textColor} !important;
  caret-color: ${textColor} !important;
  background: ${shade1} !important;
  border-color: ${mainColor} !important;
}
html[lang] #search-input:hover {
  border-color: ${shade6} !important;
  background: ${shade6} !important;
}
html[lang] #search-input:focus {
  border-color: ${mainColor} !important;
  background: ${shade1} !important;
}
html[lang] #search-input::placeholder {
  color: ${textColor}80;
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
.sidebar-item:hover {
  background: ${shade3} !important;
}
.sidebar-item .item-name {
  color: ${textColor};
}
.sidebar-item .item-categories {
  color: ${textColorShade4};
}
.sidebar-divider {
  background-color: ${shade3} !important;
}

/* Sidebar button */
.show-action-btn {
  color: ${textColorShade4} !important;
}
.show-action-btn:hover {
  color: ${textColor} !important;
}

/* Buttons */
.variant-action {
  color: ${complementaryText} !important;
  background: ${complementary} !important;
}
.variant-action:hover {
  background: ${complementaryShade1} !important;
}
.variant-action:disabled {
  background: ${complementaryShade2} !important;
}
html[lang] .variant-action.state-loading {
  background: ${complementaryShade2} !important;
}

.variant-highlight {
  color: ${textColor} !important;
  fill: ${textColor} !important;
  background: ${shade5} !important;
}
.variant-highlight .icon {
  color: currentColor !important;
}
.variant-highlight:hover {
  background: ${shade3} !important;
}
.variant-highlight:disabled {
  background: ${mainColor} !important;
}

.variant-text {
  color: currentColor !important;
}
.variant-text .icon {
  color: currentColor !important;
}
.variant-text:hover {
  background: ${shade5} !important;
}
.variant-text:disabled {
  background: ${mainColor} !important;
}

.btn.btn-secondary-lightest {
  color: ${textColor};
  background: ${shade6};
}
.btn.btn-secondary-lightest:hover {
  background: ${shade8};
}

.btn.btn-primary {
  background: ${complementary};
  color: ${complementaryText};
}
.btn.btn-primary:hover,
.btn.btn-primary:focus {
  background: ${complementaryShade1};
  color: ${complementaryText};
}

/* Color picker */
.base-color-picker-item {
  border-color: ${complementaryText} !important;
}
.base-color-picker-item.selected {
  --tw-ring-color: ${complementary} !important;
}

/* Cards */
.base-card {
  background: ${shade1} !important;
  color: ${textColor} !important;
}
.card {
  color: ${textColor} !important;
  background: ${shade1} !important;
}

/* Homepage grid cards */
.grid-item.card-content:hover {
  background: ${shade3} !important;
}

.card-session-name {
  color: ${textColor} !important;
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
  color: ${shade7} !important;
  background: ${shade1} !important;
}

/* Stream information */
.stream-info svg path[fill=white] {
  fill: ${textColor};
}

/* Stream information panel */
.carousel-card-panel {
  background: ${mainColor}99 !important;
}

/* Radio */
.radio-container input:checked {
  border-color: ${complementary} !important;
  background-color: black !important;
}
.radio-container input:checked:before {
  background-color: ${complementary} !important;
}
.radio-container label {
  color: currentColor !important;
}

/* Checkbox */
.checkbox-container {
}
.checkbox-container input {
  border-color: ${textColor} !important;
}
.checkbox-container input:hover:not(:checked):not(:disabled) {
  border-color: ${complementary} !important;
}
.checkbox-container input:checked {
  border-color: ${complementaryShade1} !important;
}
.checkbox-container input:before {
  border-color: ${textColor} !important;
}
.checkbox-container label {
  color: currentColor !important;
}

/* Another checkbox */
.base-checkbox label {
  color: ${textColor} !important;
}
.base-checkbox input:before {
  border-color: ${textColor} !important;
}
.base-checkbox input:checked:not(:disabled) {
  border-color: ${complementaryShade1} !important;
}
.base-checkbox input:hover:not(:checked):not(:disabled) {
  border-color: ${complementary} !important;
}
.base-checkbox input {
  border-color: ${textColor} !important;
}

/* Toggle button */
/* Not checked */
.toggle-button-indicator.bg-white {
  background-color: ${textColor} !important;
}
/* Checked */
.toggle-button-indicator.bg-surface-tint {
  background-color: ${complementaryText} !important;
}

/* Another toggle button */
.base-toggle:not(.toggle-disabled).toggled-on {
  background-color: ${complementary} !important;
}
.base-toggle:not(.toggle-disabled).toggled-on .base-toggle-indicator {
  background-color: ${complementaryText} !important;
}

/* Moderation panel */
.user-profile.power-user .profile {
  background-color: ${shade3} !important;
}
.user-profile .content .moderation {
  background-color: ${shade3} !important;
}
.chatroom-user-profile-history .tab-headers .title {
  color: currentColor !important;
}
.chatroom-user-profile-history .tab-headers .selected {
  background-color: ${complementary} !important;
}
.chatroom-user-profile-history .tab-headers > div:hover {
  background-color: ${shade6} !important;
}
/* Emote selector */
.chat-emote-picker-popout {
  background-color: ${shade3} !important;
}
.emote-picker-panel {
  background-color: ${shade1} !important;
}
.emote-picker-section .section-title {
  color: ${shade8} !important;
}

/* Panel tabs */
.panel-header {
  background: ${shade3} !important;
}
.panel-tabs {
  background: ${shade3} !important;
}
.panel-tabs .tab-item:hover {
  border-color: ${shade7} !important;
}
.panel-tabs .tab-item.tab-item-active {
  border-color: ${complementary} !important;
}

/* Activity feed */
.activity-feed-item:not(:last-child) {
  border-color: ${shade4} !important;
}

/* Toggle container */
.toggle-container {
  background-color: ${shade1} !important;
}
.toggle-container .label-container {
  color: ${complementary} !important;
}

/* Text input box */
.base-input-layout .input-holder {
  background-color: ${shade6} !important;
}
.base-input-layout .input-holder:focus-within {
  border-color: ${shade6};
  background-color: ${mainColor} !important;
}
.base-input-layout input {
  color: ${textColor} !important;
  caret-color: ${shade1} !important;
}
.base-input-layout .input-holder .input-icon {
  color: ${textColor} !important;
}
.base-input-layout > label {
  color: ${textColor} !important;
}
html[lang] .input-holder:has(input:disabled) {
  background-color: ${shade6} !important;
}
.input-holder:has(:not(input:disabled)):focus-within:has(> input:placeholder-shown) {
  --tw-ring-color: ${shade6} !important;
}
.input-holder > input::placeholder {
  color: ${textColorShade7} !important;
}
.input-holder > input:disabled {
  color: ${textColorShade7} !important;
}

/* Phone number input */
.vti__input {
  background: ${shade6} !important;
  color: ${textColorShade2} !important;
}
.vti__input:focus {
  border-color: ${shade3} !important;
  background: ${shade1} !important;
}
.vti__dropdown {
  background: ${shade6} !important;
  color: ${textColorShade2} !important;
}
.vti__dropdown-list {
  background: ${shade1} !important;
  color: ${textColor} !important;
}
.vti__dropdown-item {
  background: ${shade1} !important;
  color: ${textColor} !important;
}
.vti__dropdown-item.highlighted {
  background: ${shade2} !important;
}

/* Text area input box */
.base-textarea-layout > label {
  color: currentColor !important;
}
.textarea-holder > textarea {
  color: ${textColor} !important;
  caret-color: ${complementary} !important;
  border-color: ${shade6} !important;
  background-color: ${shade6} !important;
}
.textarea-holder > textarea::placeholder {
  color: ${textColorShade7} !important;
}
.base-textarea-layout textarea:focus {
  border-color: ${shade6} !important;
  background-color: ${mainColor} !important;
}
/* Found no good parent class. Trying to avoid clashes */
.absolute .overflow-hidden .hit:hover {
  background-color: ${shade4} !important;
}

/* Number input box */
.input {
  color: ${textColor};
  background-color: ${shade6};
}
.input:focus {
  border-color: ${shade6};
  background-color: ${mainColor};
}

/* Native select boxes */
.base-select > .select-label {
  color: currentColor !important;
}
.base-select > .menu-holder .select-input {
  background-color: ${shade4} !important;
}
.base-select > .menu-holder .select-input > .select-selected-item {
  color: ${textColor} !important;
}
.base-select>.menu-holder .select-input > .select-arrow-icon {
  color: ${textColor} !important;
}
.base-select-menu {
  background-color: ${shade1} !important;
}
.base-select-menu .menu-item {
  color: ${textColor} !important;
}
.base-select-menu .menu-item:not(.item-selected):hover {
  background-color: ${shade3} !important;
}
.base-select-menu .menu-item.item-selected {
  color: ${complementaryText} !important;
  background-color: ${complementaryShade1} !important;
}
.base-select-menu .menu-item.item-selected:hover {
  background-color: ${complementary} !important;
}

/* Special select boxes for live stream filters */
#livestreams .vue-select .input {
  color: ${textColor} !important;
  background-color: ${shade6} !important;
}

/* Vue select boxes */
.vue-select .btn-listbox {
  color: ${textColor} !important;
  background-color: ${shade6} !important;
}
.vue-select .btn-listbox:focus {
  border-color: ${shade6} !important;
}
.vue-select .listbox-options {
  background: ${shade1} !important;
}

/* Modview right panel */
.right-panel .divider {
  border-color: ${shade3} !important;
}
.creator-actions-item:hover {
  background-color: ${shade5} !important;
}
.channel-actions-item.channel-actions-link:hover {
  background-color: ${shade5} !important;
}

/* Modview left panel */
aside.min-w-\\[256px\\].max-w-\\[256px\\],
aside.min-w-\\[60px\\].max-w-\\[60px\\] {
  color: ${textColor} !important;
  background: ${shade1} !important;
}
.dashboard-left-menu-header > .menu-title {
  color: ${textColorShade4} !important;
}
.dashboard-left-menu-item > .menu-item-link {
  color: inherit !important;
}
.dashboard-left-menu-item > .menu-item-link:hover {
  background: ${shade5} !important;
}
.dashboard-left-menu-item > .menu-item-link.item-selected {
  color: ${complementaryText} !important;
  background: ${complementary} !important;
}
.dashboard-left-menu-item > .menu-item-link.item-selected:hover {
  background: ${complementaryShade1} !important;
}
.dashboard-left-menu-item >.menu-item-link > .content-expand-icon-holder .content-expand-icon {
  color: ${textColor} !important;
}
.dashboard-left-menu-item > .menu-item-link:not(.item-selected) > .item-new-tag {
  color: ${complementaryText} !important;
  background-color: ${complementaryShade1} !important;
}
.dashboard-left-menu-item > .menu-item-link.item-selected > .item-new-tag {
  /* The background was meant to be shade1 but it looks so bad. */
  background: ${complementaryText} !important;
  color: ${complementary} !important;
}
/* Modview left panel expandable item list background */
.dashboard-left-menu-item:before {
  background: ${shade3} !important;
}

/* Modview stats */
.session-info > :not([hidden])~:not([hidden]) {
  border-color: ${shade3} !important;
}
.session-info .stats-container .data {
  color: ${textColor} !important;
}
.session-info .stats-container .label {
  color: ${shade8} !important;
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
  background-color: ${shade6} !important;
}

/* Live indicator in the home page */
.live-tag-component {
  /* I have decided against styling this. It looks better. */
}

/* Category banner */
html[lang] .category-tile-holder.category-tile-active {
  --tw-hue-rotate: hue-rotate(${complementaryHue - 0.15}turn);
}
.category-tile-holder:hover {
  --tw-hue-rotate: hue-rotate(${complementaryHue - 0.15}turn);
}
.subcategory-card .category-banner:hover {
  filter: sepia(1) hue-rotate(${complementaryHue - 0.15}turn) contrast(1.4) brightness(1) saturate(3)
}

/* Show more button */
.show-more-btn-bg {
  background: linear-gradient(to right, transparent, ${mainColor} 12px) !important;
}

/* Grid */
.see-more .see-more-btn {
  background-color: ${mainColor} !important;
  color: ${textColor} !important;
}

.see-more:after {
  background-color: ${shade3} !important;
}

/* Loading icon */
.spinner {
  border-top-color: ${complementary};
}

/* Table */
.base-table {
  background: ${shade1} !important;
}

.base-table th {
  border-color: ${shade6}99 !important;
}

/* Link */
.link {
  color: ${complementary};
}
.link:hover {
  color: ${complementaryShade1};
}

/* Modal dialog */
.base-dialog {
  background-color: ${shade2} !important;
}
.base-modal > .modal-content {
  background: ${shade2} !important;
}

/* Video player */
.vjs-control:hover {
  color: ${complementary};
}
.vjs-menu-item:hover {
  background-color: ${complementaryShade1} !important;
  color: ${complementaryText};
}
.vjs-menu-item.vjs-selected {
  background-color: ${complementary} !important;
  color: ${complementaryText};
}
.video-js .vjs-volume-level {
  background-color: ${complementary} !important;
}
.video-js .vjs-volume-level:before {
  color: ${complementary} !important;
}

/* Video thumbnail */
.video-hover-borders {
  border-color: ${complementary} !important;
}

/* Anything else */
.bg-secondary {
  color: ${textColor};
  background: ${shade1};
}

.hover\\:bg-secondary:hover {
  background: ${shade1};
}

.bg-secondary-light {
  color: ${textColor};
  background: ${shade2};
}
.hover\\:bg-secondary-light:hover {
  background: ${shade2};
}

.bg-secondary-lighter {
  color: ${textColor};
  background: ${shade3};
}
.bg-secondary-lighter\\/80 {
  background: ${shade3}cc;
}
.odd\\:bg-secondary-lighter:nth-child(odd) {
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

.border-y-secondary-lighter {
  border-top-color: ${shade3};
  border-bottom-color: ${shade3};
}

.bg-secondary-lightest {
  background-color: ${shade6};
}
.hover\\:bg-secondary-lightest:hover {
  background-color: ${shade6};
}
.hover\\:bg-secondary-lightest\\/80:hover {
  background-color: ${shade6}cc;
}

.bg-secondary-dark {
  color: ${textColor};
  background: ${mainColor};
}
.hover\\:bg-secondary-dark:hover {
  color: ${textColor};
  background: ${mainColor};
}
.even\\:bg-secondary-dark:nth-child(even) {
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
  background: ${shade5};
}
.bg-\\[\\#232628\\],
.hover\\:bg-\\[\\#232628\\]:hover {
  color: ${textColor};
  background: ${shade3};
}
.border-\\[\\#232628\\] {
  border-color: ${shade3};
}
.border-\\[\\#24272C\\] {
  border-color: ${shade3};
}
.bg-\\[\\#271B1D\\] {
  background-color: ${shade4};
}
.bg-\\[\\#0B0E0F\\] {
  background-color: ${mainColor};
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
.bg-black\\/80 {
  background: ${mainColor}cc;
}

.text-gray-500 {
  color: ${textColorShade7};
}
.text-gray-500\\/40 {
  color: ${textColorShade7}66;
}
.text-gray-400 {
  color: ${textColorShade2};
}
.text-gray-300 {
  color: ${textColorShade3};
}
.text-gray-100 {
  color: ${textColorShade1};
}

.text-white {
  color: ${textColor};
}
.\\!text-white {
  color: ${textColor} !important;
}
.text-white\\/50 {
  color: ${textColor}80;
}
.text-white\\/80 {
  color: ${textColor}cc;
}
.text-white\\/40 {
  color: ${textColor}66;
}
.hover\\:text-white {
  color: ${textColor};
}
.group:hover .group-hover\\:text-white {
  color: ${textColor};
}

.hover\\:border-white\\/100:hover {
  border-color: ${textColor};
}

.text-black {
  color: ${mainColor};
}

.text-primary {
  color: ${complementary};
}
.text-primary\\/40 {
  color: ${complementary}66;
}

.hover\\:bg-primary:hover {
  background: ${complementary};
}
.text-secondary {
  color: ${complementaryText};
}
.text-secondary-dark {
  /* Supposed to be #0f1214. */
  color: ${complementaryText};
}
.hover\\:text-secondary:hover {
  color: ${complementaryText};
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

.text-primary-dark {
  color: ${complementaryShade1};
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
  color: ${complementaryShade1};
}

.hover\\:bg-primary-dark:hover {
  background-color: ${complementaryShade1};
}
.bg-primary-dark\\/40 {
  background-color: ${complementary}66;
}

:is(.dark .dark\\:bg-secondary-light) {
  background-color: ${shade2};
  color: ${textColor};
}
.bg-white {
  background-color: ${textColor};
}
.bg-white\\/50 {
  background-color: ${textColor}80;
}

.border-t-white {
  border-top-color: ${textColor};
}

.fill-white {
  fill: ${textColor} !important;
}

.text-\\[\\#53FC18\\] {
  color: ${complementary};
}
.text-\\[\\#999999\\] {
  color: ${textColorShade6};
}
.text-\\[\\#b1bcc3\\] {
  color: ${textColorShade4};
}
.text-\\[\\#a8b1b8\\] {
  color: ${textColorShade5};
}
.text-\\[\\#75FD46\\] {
  color: ${complementaryShade3};
}
.text-\\[\\#D2DAE0\\] {
  color: ${textColorShade3};
}
.text-\\[\\#E9ECED\\] {
  color: ${textColorShade2};
}

.bg-surface-tint {
  background-color: ${shade4};
}

input::placeholder {
  color: ${shade8};
}
textarea::placeholder {
  color: ${shade8};
}
`
    } else {
      return ''
    }
  }
}
