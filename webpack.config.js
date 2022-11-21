module.exports = [
  {
    mode: 'development',
    entry: './src/preload/index.mjs',
    target: 'electron-renderer',
    output: {
      path: __dirname + '/dist/preload',
      filename: 'index.js'
    }
  }
];
