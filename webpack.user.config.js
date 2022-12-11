const path = require('path')
const { DefinePlugin } = require('webpack')
const configs = require('./webpack.base.config.js')
const WebpackObfuscator = require('webpack-obfuscator');

for (let config of configs) {
  config.plugins.push(
    new DefinePlugin({
      ADMIN: false
    })
  )

  if (config.mode === 'production') {
    config.plugins.push(
      new WebpackObfuscator({
        stringArray: true
      })
    )
  }

  config.output.path = config.output.path.replace('[REPLACE]', path.join(__dirname, 'dist', 'user'))
}

module.exports = configs
