const { app } = require('electron');
const path = require('path');
const fs = require('fs')

exports.FileStorage = class FileStorage {
  constructor({
    prefix = 'misc'
  } = {}) {
    const userDataPath = app.getPath('userData');

    if (userDataPath === null) {
      throw new Error('Missing user data path.')
    }

    this._basePath = path.join(userDataPath, prefix)
  }

  async readAll(p) {
    await fs.promises.mkdir(this._basePath, { recursive: true })
    const data = await fs.promises.readFile(path.join(this._basePath, p), "binary")
    return Buffer.from(data)
  }

  async writeAll(p, contents) {
    await fs.promises.mkdir(this._basePath, { recursive: true })
    await fs.promises.writeFile(path.join(this._basePath, p), contents)
  }

  async fullPath(p) {
    return path.join(this._basePath, p)
  }
}
