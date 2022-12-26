const {
  generatePreloadConfig,
  generateElectronConfig
} = require('./webpack-config')

let production = process.env.NODE_ENV === 'production'

module.exports = [
  generatePreloadConfig({
    production,
    outputDir: 'electron-admin',
    admin: true,
  }),
  generateElectronConfig({
    production,
    outputDir: 'electron-admin',
    admin: true,
  })
]
