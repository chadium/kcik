import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'

export class UsernameColorVueComponentHooker extends Hooker {
  async hook() {
    const stateApi = this.pimp.getApi('state')
    const vueComponentApi = this.pimp.getApi('vueComponent')

    vueComponentApi.waitForComponentByName('CMUsername', (id) => {
      vueComponentApi.replaceSetup(id, (props, ctx, { originalSetup }) => {
        let originalRender = originalSetup(props, ctx)

        return (_ctx, _cache, $props, $setup, $data, $options) => {
          const node = originalRender(_ctx, _cache, $props, $setup, $data, $options)
      
          let color = stateApi.getUsernameColor(props.sender.username)

          if (color !== null) {
            node.props.style.color = color
          }

          return node
        }
      })
    })
  }

  async unhook() {
    const id = vueComponentApi.getComponentIdByName('CMUsername')

    if (id !== null) {
      vueComponentApi.restoreSetup(id)
    }
  }
}
