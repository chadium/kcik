const Dotenv = require('dotenv-webpack');

module.exports = [
  {
    mode: 'development',
    entry: './src/preload/index.mjs',
    target: 'electron-renderer',
    module: {
      rules: [
        {
          test: /\.css$/i,
          exclude: /\.lazy\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.lazy\.css$/i,
          use: [
            { loader: "style-loader", options: { injectType: "lazyStyleTag" } },
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
      new Dotenv()
    ],
    output: {
      path: __dirname + '/dist/preload',
      filename: 'index.js'
    }
  }
];
