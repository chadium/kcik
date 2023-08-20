import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

function sanitizeContent(content) {
  let regexp = /\[emote:(.+?):.+?\]/g

  for (let entry of content.matchAll(regexp)) {
      let replacementString = entry[0]
      content = content.replaceAll(replacementString, '[emote]');
  }

  let regexp2 = /\[emoji:(.+?)\]/g

  for (let entry of content.matchAll(regexp2)) {
      let replacementString = entry[0]
      content = content.replaceAll(replacementString, '[emoji]');
  }

  return content
}

export class ChatMessageDeletedHooker extends Hooker {
  #showDeleted

  constructor() {
    super()

    this.#showDeleted = false
  }

  async hook() {
    const vueComponentApi = this.pimp.getApi('vueComponent')

    return {
      name: 'chatMessageDeleted',
      api: {
        setChatMessageDeletedMode: (state) => {
          if (this.#showDeleted === state) {
            // Do nothing
            return
          }

          if (state) {
            this.#showDeleted = state

            vueComponentApi.waitForComponentByName('CMDeleted', (id) => {
              if (!this.#showDeleted) {
                return
              }

              vueComponentApi.replaceSetup(id, (props, ctx, { originalSetup }) => {
                let originalRender = originalSetup(props, ctx)
        
                return (_ctx, _cache, $props, $setup, $data, $options) => {
                  const node = originalRender()
                  node.props.style = 'text-decoration: line-through; word-break: break-word; white-space: normal;'
                  node.children = sanitizeContent(_ctx._.parent.props.chatMessage.content)
                  return node
                }
              })
            })
          } else {
            this.#showDeleted = state

            const id = vueComponentApi.getComponentIdByName('CMDeleted')

            if (id !== null) {
              vueComponentApi.restoreSetup(id)
            }
          }
        }
      }
    }
  }

  unhook() {
  }
}
