const { DefinePlugin } = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const Dotenv = require('dotenv-webpack')
// Used by dotenv-webpack during compilation but turns out I need some of
// those variables here. So I use the same module to stay consistent.
require('dotenv-defaults').config()

module.exports = [
  {
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
      new DefinePlugin({
        // We use this because process.env is replaced by "MISSING_ENV_VAR"
        // when the environment variable is not defined. Webpack will *not*
        // remove code in if statements in that case.
        ADMIN: process.env.ADMIN === 'enabled'
      })
    ],
    output: {
      path: __dirname + '/dist/preload',
      filename: 'index.js',
      // Some stylesheet in react-select references a resource using url() so I need
      // to explicitly define this.
      publicPath: '/',
    },
    optimization: {
      minimize: true,
      usedExports: true, // Removes unused code.
    }
  }
];
