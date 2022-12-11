const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const Dotenv = require('dotenv-webpack')
// Used by dotenv-webpack during compilation but turns out I need some of
// those variables here. So I use the same module to stay consistent.
require('dotenv-defaults').config()

const mainConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/electron/index.mjs',
  target: 'electron-main',
  plugins: [
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
  }
}

const rendererConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
    minimize: true,
    usedExports: true, // Removes unused code.
  }
}

module.exports = [mainConfig, rendererConfig]
