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
    let roomApi = this.pimp.getApi('room')

    ipcRenderer.send('menu.join-match.enable', roomApi.getRoom() === null)

    roomApi.on('join', () => {
      ipcRenderer.send('menu.join-match.enable', false)
    })

    roomApi.on('leave', () => {
      ipcRenderer.send('menu.join-match.enable', true)
    })

    ipcRenderer.on('menu.join-match.click', async () => {
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

        await roomApi.joinRoom(regionId, roomId)
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
    throw new Error('To be implemented.')
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
