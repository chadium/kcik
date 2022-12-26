const path = require('path')
const { DefinePlugin } = require('webpack')
const configs = require('./webpack.base.config.js')

for (let config of configs) {
  config.plugins.push(
    new DefinePlugin({
      BOOMER_ADMIN: true
    })
  )

  config.output.path = config.output.path.replace('[REPLACE]', path.join(__dirname, 'dist', 'electron-admin'))
}

module.exports = configs
