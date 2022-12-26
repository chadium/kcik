const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require("terser-webpack-plugin");
const pkg = require('./package.json')
const Dotenv = require('dotenv-webpack')
const { DefinePlugin } = require('webpack')
// Used by dotenv-webpack during compilation but turns out I need some of
// those variables here. So I use the same module to stay consistent.
require('dotenv-defaults').config()

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const version = (() => {
  if (mode === 'production') {
    return JSON.stringify('v' + pkg.version.replaceAll(/(\.0)+$/g, ""))
  } else {
    return JSON.stringify('DEV BUILD ' + new Date().toISOString())
  }
})()

let definePlugin = new DefinePlugin({
  BOOMER_VERSION: version
})

const mainConfig = {
  mode,
  entry: './src/electron/index.mjs',
  target: 'electron-main',
  plugins: [
    definePlugin,
    new Dotenv(),
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: false
    // })
  ],
  output: {
    path: '[REPLACE]/electron',
    filename: 'index.js'
  },
  optimization: {
    minimize: true,
    usedExports: true, // Removes unused code.
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  }
}

const rendererConfig = {
  mode,
  entry: './src/preload/index.mjs',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.css$/i,
        exclude: [/\.lazy\.css$/i, /\.lazy\.module\.css$/i],
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.lazy\.css$/i,
        exclude: /\.lazy\.module\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "lazySingletonStyleTag" } },
          "css-loader",
        ],
      },
      {
        test: /\.lazy\.module\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "lazySingletonStyleTag" } },
          "css-loader",
        ],
      },
      {
        test: /\.?jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
    ]
  },
  plugins: [
    definePlugin,
    new Dotenv(),
    // new BundleAnalyzerPlugin({
    //   openAnalyzer: false
    // }),
  ],
  output: {
    path: '[REPLACE]/preload',
    filename: 'index.js'
  },
  optimization: {
    minimize: mode === 'production',
    usedExports: true, // Removes unused code.
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  devtool: 'cheap-module-source-map'
}

module.exports = [mainConfig, rendererConfig]
