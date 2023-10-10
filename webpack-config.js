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
    return 'ALPHA VERSION ' + pkg.version.replaceAll(/(\.0)+$/g, "")
  } else {
    return 'DEV BUILD ' + new Date().toISOString()
  }
}

function chooseSourceMapType(inlineSourceMap) {
  return inlineSourceMap ? "inline-source-map" : "source-map"
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
  inlineSourceMap = false,
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
        BOOMER_VERSION: JSON.stringify(makeVersion(production))
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
    devtool: !production ? chooseSourceMapType(inlineSourceMap) : false
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
  inlineSourceMap = false,
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
        BOOMER_VERSION: JSON.stringify(makeVersion(production)),
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
    devtool: !production ? chooseSourceMapType(inlineSourceMap) : false
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
  inlineSourceMap = false,
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
        BOOMER_VERSION: JSON.stringify(makeVersion(production)),
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
    devtool: !production ? chooseSourceMapType(inlineSourceMap) : false
  }

  let manifestJson = {
    manifest_version: 3,
    name: "KCIK - kick.com plus better",
    description: "An open source extension for the streaming platform kick.com",
    version_name: makeVersion(production),
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
        matches: ["https://kick.com/*"],
        js: ["chrome-content/index.js"],
        run_at: 'document_start'
      }
    ],
    permissions: [
      "storage"
    ],
    web_accessible_resources: [
      {
        resources: ["preload/index.js", "icon128.png"],
        matches: ["https://kick.com/*"]
      }
    ],
    key: `
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgW7qCfPu++Kc0NoR3vt8
X0vgKFT1VP8m0ch80QUA1TY9hbvRnQXLoffS7HfMJE1OKKkDm4EOPHAQJ5zRWhab
HBaynbUgwWFy2cCYRjahQknAAInIHYX+zZB5BPpOb7QvFupRHJFF342K36CJ2QbV
mF5CVdTcoekcgmqkl1sTlVrFC+zTVItm/MUv3iV+f4u9dHPYxtQqxUuxIIiewWGz
fyeXEc7c7dQde95KdxBIsYGs1TyQvMlYTT7QKcCkShWETV87rZkSbCBZPdthYru2
Mz4OeDQPM7svcFvtO8sfDrD6uYayy5khVPxK1wuugvOCXrS8/FaooiGgfVOaUz35
RwIDAQAB
`.replaceAll(/\s+/g, '')
  }

  config.plugins.push(generate({
    file: path.join(__dirname, 'dist', outputDir, 'manifest.json'),
    content: JSON.stringify(manifestJson)
  }))

  return config
}

exports.generateChromeBackgroundConfig = ({
  inlineSourceMap = false,
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
        BOOMER_VERSION: JSON.stringify(makeVersion(production)),
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
    devtool: !production ? chooseSourceMapType(inlineSourceMap) : false
  }

  return config
}


exports.generateChromePopupConfig = ({
  inlineSourceMap = false,
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
        BOOMER_VERSION: JSON.stringify(makeVersion(production)),
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
    devtool: !production ? chooseSourceMapType(inlineSourceMap) : false
  }

  return config
}
