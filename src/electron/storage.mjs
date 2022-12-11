import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export class FileNotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class FileStorage {
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
    let fullPath = path.join(this._basePath, p)
    let directory = path.dirname(fullPath)
    await fs.promises.mkdir(directory, { recursive: true })

    try {
      let data = await fs.promises.readFile(fullPath)
      return Buffer.from(data)
    } catch (e) {
      if (e.message.startsWith('ENOENT')) {
        throw new FileNotFoundError(`${fullPath} not found`)
      } else {
        throw e
      }
    }
  }

  async writeAll(p, contents) {
    let fullPath = path.join(this._basePath, p)
    let directory = path.dirname(fullPath)
    await fs.promises.mkdir(directory, { recursive: true })
    await fs.promises.writeFile(fullPath, contents)
  }

  fullPath(p) {
    return path.join(this._basePath, p)
  }
}
