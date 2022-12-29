const {
  generatePreloadConfig,
  generateChromeContentConfig,
  generateChromeBackgroundConfig,
  generateChromePopupConfig
} = require('./webpack-config')

let production = process.env.NODE_ENV === 'production'

module.exports = [
  generatePreloadConfig({
    production,
    outputDir: 'chrome-user',
    chrome: true
  }),
  generateChromeContentConfig({
    production,
    outputDir: 'chrome-user',
    chrome: true
  }),
  generateChromePopupConfig({
    production,
    outputDir: 'chrome-user',
    chrome: true
  })
]
