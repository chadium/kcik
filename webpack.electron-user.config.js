const {
  generatePreloadConfig,
  generateElectronConfig
} = require('./webpack-config')

let production = process.env.NODE_ENV === 'production'

module.exports = [
  generatePreloadConfig({
    production,
    outputDir: 'electron-user',
  }),
  generateElectronConfig({
    production,
    outputDir: 'electron-user',
  })
]
