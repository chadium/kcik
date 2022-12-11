const path = require('path')
const { DefinePlugin } = require('webpack')
const configs = require('./webpack.base.config.js')

for (let config of configs) {
  config.plugins.push(
    new DefinePlugin({
      ADMIN: false
    })
  )

  config.output.path = config.output.path.replace('[REPLACE]', path.join(__dirname, 'dist', 'user'))
}

module.exports = configs
