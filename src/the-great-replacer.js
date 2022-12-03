const { session } = require('electron')
const { httpRequest } = require('./http-request')

exports.TheGreatReplacer = class TheGreatReplacer {
  constructor({ storage }) {
    this._storage = storage

    const filter = {
      urls: ['https://kirka.io/*.js']
    }

    session.defaultSession.webRequest.onBeforeRequest(filter, async (details, callback) => {
      try {
        console.log('Client has requested:', details.url)

        if (details.url.includes('/app.')) {
          let { body } = await httpRequest({ url: details.url })

          let contents = body.toString()

          await this._storage.writeAll('app', contents)

          callback({
            response: {
              redirectURL: 'file://' + this._storage.fullPath('app')
            }
          })
        } else {
          // Won't do anything to it.
          callback({ response: {} })
        }
      } catch (e) {
        console.error(e)
      }
    })
  }
}
