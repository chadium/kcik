import { Hooker } from '../../Pimp.mjs'
import { ipcRenderer } from 'electron'
import { PrompterCancelError } from '../../Prompter.mjs'
import * as log from '../../log.mjs'

export class JoinMatchHooker extends Hooker {
  constructor(prompter, messenger) {
    super()
    this._prompter = prompter
    this._messenger = messenger
  }

  hook() {
    ipcRenderer.on('join-match', async () => {
      try {
        let buttons = [
          {
            text: 'Join',
            action: 'accept',
          },
          {
            text: 'Cancel',
            action: 'reject',
            theme: 'other',
          },
        ]

        let result = await this._prompter.prompt({ title: 'Join match', placeholder: "Put link here", buttons })

        let [regionId, roomId] = this._extractIds(result.input)

        await this.pimp.getApi('room').joinRoom(regionId, roomId)
      } catch (e) {
        if (e instanceof PrompterCancelError) {
          // Ignore.
        } else {
          log.bad('JoinMatch', e)
          await this._messenger.prompt({ title: e.name, message: e.message })
        }
      }
    })
  }

  unhook() {
  }

  _extractIds(url) {
    const regexp = /\/games\/(.+)~(.+)$/

    let matches = regexp.exec(url)

    if (matches === null) {
      throw new Error('Link not recognized. Did you type it correctly?')
    }

    return [matches[1], matches[2]]
  }
}
