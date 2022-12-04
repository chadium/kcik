const prettier = require('prettier')
const { session } = require('electron')
const http = require('http');
const { deobfuscate } = require('js-deobfuscator')
const { httpRequest } = require('./http-request')
const { FileNotFoundError } = require('./storage')

exports.TheGreatReplacer = class TheGreatReplacer {
  constructor({ cacheStorage, replaceStorage }) {
    this._cacheStorage = cacheStorage
    this._replaceStorage = replaceStorage

    const filter = {
      urls: ['https://kirka.io/*.js']
    }

    session.defaultSession.webRequest.onBeforeRequest(filter, async (details, callback) => {
      try {
        console.log('Client requests', details.url, 'but will be redirected')

        let url = new URL(details.url)

        callback({
          redirectURL: 'http://127.0.0.1:61385' + url.pathname
        })
      } catch (e) {
        console.error(e)
      }
    })

    http.createServer(async (request, response) => {
        try {
          if (request.method === 'OPTIONS') {
            response.writeHead(204, {
              'Access-Control-Allow-Origin': 'https://kirka.io',
              'Access-Control-Allow-Credentials': 'true'
            })
            response.end()
          } else if (request.method === 'GET') {
            let pathname = request.url

            let { contents } = await this._cachedFile(pathname)

            try {
              let replacement = await this._replacedFile(pathname, contents)
              contents = replacement.contents
            } catch (e) {
              console.error(`Failed to deobfuscate ${pathname}. Will use original source.`, e)
            }

            response.writeHead(200, {
              'Content-Type': 'application/javascript; charset=utf-8',
              'Access-Control-Allow-Origin': 'https://kirka.io'
            })
            response.end(contents)
          }
        } catch (e) {
          console.error(e)
          response.writeHead(500)
          response.end()
        }
    }).listen(61385);
  }

  async _cachedFile(pathname) {
    try {
      let contents = await this._cacheStorage.readAll(pathname)

      return { contents, path: this._cacheStorage.fullPath(pathname) }
    } catch (e) {
      let message = `${url} was not cached`
      if (e instanceof FileNotFoundError) {
        console.warn(message)
      } else {
        console.error(message, e)
      }

      let { body } = await httpRequest({ url: 'https://kirka.io/' + pathname })

      await this._cacheStorage.writeAll(pathname, body)

      return { contents: body, path: this._cacheStorage.fullPath(pathname) }
    }
  }

  async _replacedFile(pathname, originalContents) {
    let version = 'v31'
    pathname = `/${version}${pathname}`

    try {
      let contents = await this._replaceStorage.readAll(pathname)

      return { contents, path: this._replaceStorage.fullPath(pathname) }
    } catch (e) {
      if (e instanceof FileNotFoundError) {
        // Ignore.
      } else {
        throw e
      }

      let contents = this._deobfuscate(originalContents)

      await this._replaceStorage.writeAll(pathname, contents)

      return { contents, path: this._replaceStorage.fullPath(pathname) }
    }
  }

  _deobfuscate(contents) {
    let code = contents.toString()

    try {
      code = deobfuscate(code, {
        arrays: {
          unpackArrays: true,
          removeArrays: true,
        },
        proxyFunctions: {
          replaceProxyFunctions: false,
          removeProxyFunctions: false,
        },
        expressions: {
          simplifyExpressions: true,
          removeDeadBranches: false,
        },
        miscellaneous: {
          beautify: false,
          simplifyProperties: false,
          renameHexIdentifiers: false,
        },
      })
    } catch (e) {
      console.warn(e)
    }

    return prettier.format(code, { semi: true, parser: "babel", charset: 'utf-8' });
  }
}
