const path = require('path')
const { DefinePlugin } = require('webpack')
const configs = require('./webpack.base.config.js')
const WebpackObfuscator = require('webpack-obfuscator');
const pkg = require('./package.json')
const generate = require('generate-file-webpack-plugin');

for (let config of configs) {
  config.plugins.push(
    new DefinePlugin({
      BOOMER_ADMIN: false
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

let forgeConfig = {
  packagerConfig: {
    asar: true,
    prune: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux'],
    }
  ],
};

configs[0].plugins.push(generate({
    file: path.join(__dirname, 'dist', 'user', 'forge.config.js'),
    content: `module.exports = ${JSON.stringify(forgeConfig)}`
}))

let packageJson = {
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  main: "electron/index.js",
  scripts: {
    "package": "electron-forge package",
    "make": "electron-forge make",
  },
  devDependencies: {
    "electron": "^21.3.0",
    "@electron-forge/cli": "^6.0.3",
    "@electron-forge/maker-deb": "^6.0.3",
    "@electron-forge/maker-rpm": "^6.0.3",
    "@electron-forge/maker-squirrel": "^6.0.3",
    "@electron-forge/maker-zip": "^6.0.3",
  }
}

configs[0].plugins.push(generate({
    file: path.join(__dirname, 'dist', 'user', 'package.json'),
    content: JSON.stringify(packageJson)
}))

module.exports = configs
