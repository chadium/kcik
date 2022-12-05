import { ipcRenderer } from 'electron'
import { PrompterCancelError } from '../../Prompter.mjs'
import * as log from '../../log.mjs'

export class JoinMatchHooker {
  constructor(prompter) {
    this._prompter = prompter
  }

  hook(pimp) {
    ipcRenderer.on('join-match', async () => {
      try {
        let result = await this._prompter.prompt({ title: 'Join match', placeholder: "Put link here" })

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

  unhook(pimp) {
  }
}
