const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require("terser-webpack-plugin");
const pkg = require('./package.json')
const Dotenv = require('dotenv-webpack')
const { DefinePlugin } = require('webpack')
const WebpackObfuscator = require('webpack-obfuscator');
const generate = require('generate-file-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Used by dotenv-webpack during compilation but turns out I need some of
// those variables here. So I use the same module to stay consistent.
require('dotenv-defaults').config()

function makeVersion(production) {
  if (production) {
    return JSON.stringify('v' + pkg.version.replaceAll(/(\.0)+$/g, ""))
  } else {
    return JSON.stringify('DEV BUILD ' + new Date().toISOString())
  }
}

const uiRules = [
  {
    test: /\.css$/i,
    exclude: [/\.lazy\.css$/i, /\.lazy\.module\.css$/i],
    use: ["style-loader", "css-loader"],
    sideEffects: true,
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

exports.generateElectronConfig = ({
  production = false,
  outputDir,
  admin = false
}) => {
  let config = {
    mode: production ? 'production' : 'development',
    entry: './src/electron/index.mjs',
    target: 'electron-main',
    plugins: [
      new DefinePlugin({
        BOOMER_ADMIN: admin,
        BOOMER_VERSION: makeVersion(production)
      }),
      new Dotenv({
        systemvars: true
      }),
      // new BundleAnalyzerPlugin({
      //   openAnalyzer: false
      // })
    ],
    output: {
      path: path.join(__dirname, 'dist', outputDir, 'electron'),
      filename: 'index.js'
    },
    optimization: {
      minimize: production,
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
    devtool: !production ? "inline-source-map" : undefined
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
  
  config.plugins.push(generate({
    file: path.join(__dirname, 'dist', outputDir, 'forge.config.js'),
    content: `module.exports = ${JSON.stringify(forgeConfig)}`
  }))
  
  let packageJson = {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    author: pkg.author,
    main: "electron/index.js",
    scripts: {
      "package": "electron-forge package",
      "make": "electron-forge make",
    },
    devDependencies: {
      "electron": pkg.devDependencies.electron,
      "@electron-forge/cli": "^6.0.3",
      "@electron-forge/maker-deb": "^6.0.3",
      "@electron-forge/maker-rpm": "^6.0.3",
      "@electron-forge/maker-squirrel": "^6.0.3",
      "@electron-forge/maker-zip": "^6.0.3",
    }
  }
  
  config.plugins.push(generate({
    file: path.join(__dirname, 'dist', outputDir, 'package.json'),
    content: JSON.stringify(packageJson)
  }))

  return config
}

exports.generatePreloadConfig = ({
  production = false,
  outputDir,
  chrome = false,
  admin = false
}) => {
  let config = {
    mode: production ? 'production' : 'development',
    entry: './src/preload/index.mjs',
    target: chrome ? 'web' : 'electron-renderer',
    module: {
      rules: [
        ...uiRules,
      ]
    },
    plugins: [
      new DefinePlugin({
        BOOMER_ADMIN: admin,
        BOOMER_VERSION: makeVersion(production),
        BOOMER_CHROME_EXTENSION: chrome
      }),
      new Dotenv({
        systemvars: true
      }),
      // new BundleAnalyzerPlugin({
      //   openAnalyzer: false
      // }),
    ],
    output: {
      path: path.join(__dirname, 'dist', outputDir, 'preload'),
      filename: 'index.js'
    },
    optimization: {
      minimize: production,
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
    devtool: !production ? "inline-source-map" : undefined
  }

  if (chrome) {
    config.resolve = {
      alias: {
        electron: path.join(__dirname, 'src/empty.js')
      },
    }
  }

  return config
}

exports.generateChromeContentConfig = ({
  production = false,
  outputDir,
  chrome = true,
  admin = false
}) => {
  const config = {
    mode: production ? 'production' : 'development',
    entry: './src/chrome-content/index.mjs',
    target: 'web',
    output: {
      path: path.join(__dirname, 'dist', outputDir, 'chrome-content'),
      filename: 'index.js'
    },
    plugins: [
      new DefinePlugin({
        BOOMER_ADMIN: admin,
        BOOMER_VERSION: makeVersion(production),
        BOOMER_CHROME_EXTENSION: chrome
      }),
      new Dotenv({
        systemvars: true
      }),
      // new BundleAnalyzerPlugin({
      //   openAnalyzer: false
      // }),
    ],
    optimization: {
      minimize: production,
      usedExports: true, // Removes onions.
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
    devtool: !production ? "inline-source-map" : undefined
  }

  let manifestJson = {
    manifest_version: 3,
    name: "Boomer Kirka Client",
    description: "Join custom matches with the28yearoldboomer on Twitch!",
    version: pkg.version,
    author: pkg.author,
    icons: {
      "128": "icon128.png",
    },
    action: {
      default_popup: "chrome-popup/index.html",
    },
    content_scripts: [
      {
        matches: ["https://kirka.io/*"],
        js: ["chrome-content/index.js"],
        run_at: 'document_idle'
      }
    ],
    web_accessible_resources: [
      {
        resources: ["preload/index.js"],
        matches: ["https://kirka.io/*"]
      }
    ],
    key: `
      MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgD0+4qpIsQnmpTZm8PBh
      zZz4yKA5IbOTGFIkemplSc8ExWIvmX9nFloal7MJHNZCky8LgNHdFop0ucI3+LCk
      fSZ83R560FNxI/ZvBNDs0QBW9Sy5B+IaRi78ego3LGnbk8D36a6/tOWvoyi33J8E
      T+vhtLwv5bTp5Bf6b9zrwIzFBs991QdZvVtcfi+x7PORdzQIn+QqhXWRvlK9f2XA
      01znfw5HCmKKT/8v4vkOtMWByt55VUorvhONLjRRCDvVcUb0AUd6kcbh8vZnRRa6
      LWCZEM/AQyYAp3qb1qRX70JnBqmhPg3Y6496kSQlA1qlUjKIgeYrQ8Sg+9YQX08V
      kwIDAQAB
`.replaceAll(/\s+/g, '')
  }

  config.plugins.push(generate({
    file: path.join(__dirname, 'dist', outputDir, 'manifest.json'),
    content: JSON.stringify(manifestJson)
  }))

  return config
}

exports.generateChromeBackgroundConfig = ({
  production = false,
  outputDir,
  chrome = true,
  admin = false
}) => {
  const config = {
    mode: production ? 'production' : 'development',
    entry: './src/chrome-background/index.mjs',
    target: 'web',
    output: {
      path: path.join(__dirname, 'dist', outputDir, 'chrome-background'),
      filename: 'index.js'
    },
    plugins: [
      new DefinePlugin({
        BOOMER_ADMIN: admin,
        BOOMER_VERSION: makeVersion(production),
        BOOMER_CHROME_EXTENSION: chrome
      }),
      new Dotenv({
        systemvars: true
      }),
      // new BundleAnalyzerPlugin({
      //   openAnalyzer: false
      // }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'src', 'icon128.png'),
            to: path.join(__dirname, 'dist', outputDir, 'icon128.png')
          },
        ],
      }),
    ],
    optimization: {
      minimize: production,
      usedExports: true, // Removes onions.
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
    devtool: !production ? "inline-source-map" : undefined
  }

  return config
}


exports.generateChromePopupConfig = ({
  production = false,
  outputDir,
  chrome = true,
  admin = false
}) => {
  const config = {
    mode: production ? 'production' : 'development',
    entry: './src/chrome-popup/index.mjs',
    target: 'web',
    output: {
      path: path.join(__dirname, 'dist', outputDir, 'chrome-popup'),
      filename: 'index.js'
    },
    module: {
      rules: [
        ...uiRules,
      ]
    },
    plugins: [
      new HtmlWebpackPlugin(),
      new DefinePlugin({
        BOOMER_ADMIN: admin,
        BOOMER_VERSION: makeVersion(production),
        BOOMER_CHROME_EXTENSION: chrome
      }),
      new Dotenv({
        systemvars: true
      }),
      // new BundleAnalyzerPlugin({
      //   openAnalyzer: false
      // }),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'src', 'icon128.png'),
            to: path.join(__dirname, 'dist', outputDir, 'icon128.png')
          },
        ],
      }),
    ],
    optimization: {
      minimize: production,
      usedExports: true, // Removes onions.
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
    devtool: !production ? "inline-source-map" : undefined
  }

  return config
}
