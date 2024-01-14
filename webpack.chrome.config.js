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
    outputDir: 'chrome',
    target: 'web',
    webVariant: 'chrome',
    inlineSourceMap: true
  }),
  generateChromeContentConfig({
    production,
    outputDir: 'chrome',
    target: 'web',
    webVariant: 'chrome',
    inlineSourceMap: true
  }),
  generateChromePopupConfig({
    production,
    outputDir: 'chrome',
    target: 'web',
    webVariant: 'chrome',
    inlineSourceMap: true
  })
]
