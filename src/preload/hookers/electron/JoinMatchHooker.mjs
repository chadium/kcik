import { Hooker } from '../../Pimp.mjs'
import { ipcRenderer } from 'electron'
import { PrompterCancelError } from '../../Prompter.mjs'
import * as log from '../../log.mjs'

export class JoinMatchHooker extends Hooker {
  constructor(prompter) {
    super()
    this._prompter = prompter
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

        ipcRenderer.send('join-match', result.input)
      } catch (e) {
        if (e instanceof PrompterCancelError) {
          // Ignore.
        } else {
          log.bad('JoinMatch', e)
        }
      }
    })
  }

  unhook() {
  }
}
