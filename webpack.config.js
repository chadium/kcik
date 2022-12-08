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
      new Dotenv()
    ],
    output: {
      path: __dirname + '/dist/preload',
      filename: 'index.js',
      // Some stylesheet in react-select references a resource using url() so I need
      // to explicitly define this.
      publicPath: '/',
    }
  }
];
