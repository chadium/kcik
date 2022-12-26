const path = require('path')
const { DefinePlugin } = require('webpack')
const configs = require('./webpack.base.config.js')
const WebpackObfuscator = require('webpack-obfuscator');
const pkg = require('./package.json')
const generate = require('generate-file-webpack-plugin');

const contentConfig = {
  mode: 'development',
  entry: './src/chrome-content/index.mjs',
  target: 'web',
  output: {
    path: path.join(__dirname, 'dist', 'chrome-user', 'content'),
    filename: 'index.js'
  },
  optimization: {
    minimize: false,
    usedExports: true, // Removes onions.
  },
  devtool: "inline-source-map"
}

const backgroundConfig = {
  mode: 'development',
  entry: './src/chrome-background/index.mjs',
  target: 'web',
  output: {
    path: path.join(__dirname, 'dist', 'chrome-user', 'background'),
    filename: 'index.js'
  },
  optimization: {
    minimize: false,
    usedExports: true, // Removes unused code.
  },
  devtool: "inline-source-map"
}

configs[1].plugins.push(
  new DefinePlugin({
    BOOMER_ADMIN: false,
    BOOMER_CHROME_EXTENSION: true
  })
)

configs[1].resolve = {
  alias: {
    fs: path.join(__dirname, 'src/empty.js'),
    path: path.join(__dirname, 'src/empty.js'),
  },
}

if (configs[1].mode === 'production') {
  configs[1].plugins.push(
    new WebpackObfuscator({
      stringArray: true
    })
  )
}

configs[1].target = 'web'

configs[1].output.path = configs[1].output.path.replace('[REPLACE]', path.join(__dirname, 'dist', 'chrome-user'))

let manifestJson = {
  manifest_version: 3,
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  author: pkg.author,
  permissions: ["activeTab", "scripting"],
  action: {
    default_title: "This is a test"
  },
  content_scripts: [
    {
      matches: ["https://kirka.io/*"],
      js: ["content/index.js"],
      run_at: 'document_idle'
    }
  ],
  background: {
    service_worker: "background/index.js"
  },
  web_accessible_resources: [
    {
      resources: ["preload/index.js"],
      matches: ["https://kirka.io/*"]
    }
  ]
}

configs[1].plugins.push(generate({
    file: path.join(__dirname, 'dist', 'chrome-user', 'manifest.json'),
    content: JSON.stringify(manifestJson)
}))

module.exports = [contentConfig, backgroundConfig, configs[1]]
