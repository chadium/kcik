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
    outputDir: 'firefox',
    target: 'web',
    webVariant: 'firefox',
    inlineSourceMap: true
  }),
  generateChromeContentConfig({
    production,
    outputDir: 'firefox',
    target: 'web',
    webVariant: 'firefox',
    inlineSourceMap: true
  }),
  generateChromePopupConfig({
    production,
    outputDir: 'firefox',
    target: 'web',
    webVariant: 'firefox',
    inlineSourceMap: true
  })
]
