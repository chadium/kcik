import { Hooker } from '../../Pimp.mjs'
import * as log from '../../log.mjs'
import { Machine, MachineState } from '../../state-machine.mjs'

function renderTooltip(vueComponentApi, tooltipOpen, tooltipText) {
  const style = {
    position: 'fixed',
    transform: 'translateY(-50%)',
    display: 'none',
    zIndex: 11,
    padding: '.25rem .5rem'
  }

  if (tooltipOpen.value !== null) {
    style.display = 'block'
    style.left = (tooltipOpen.value.x + tooltipOpen.value.width) + 'px'
    style.top = (tooltipOpen.value.y + tooltipOpen.value.height / 2) + 'px'
  }

  const tooltipNode = vueComponentApi.h('div', {
    class: 'bg-gray-900 rounded shadow border-primary/0 text-lg !border-primary/100 !font-semibold"',
    style
  })

  tooltipNode.patchFlag |= vueComponentApi.patchFlags.TEXT | vueComponentApi.patchFlags.STYLE
  tooltipNode.shapeFlag |= vueComponentApi.shapeFlags.TEXT_CHILDREN
  tooltipNode.dynamicProps = ['style']
  tooltipNode.children = tooltipText.value ? tooltipText.value : 'Loading...'

  return tooltipNode
}

class DisabledState extends MachineState {}

class EnabledState extends MachineState {
  constructor() {
    super()
    this.sm = null
  }

  async [MachineState.ON_ENTER]() {
    log.info('SidebarStreamTooltip', 'Enabled.')

    const vueComponentApi = this.machine.pimp.getApi('vueComponent')

    vueComponentApi.waitForComponentByName('SidebarItem', (id) => {
      vueComponentApi.replaceSetup(id, (props, ctx, { originalSetup }) => {
        let originalRender = originalSetup(props, ctx)

        let tooltipText = vueComponentApi.ref(null)
        let tooltipOpen = vueComponentApi.ref(null)

        return (_ctx, _cache, $props, $setup, $data, $options) => {
          const node = originalRender()

          node.props.onMouseover = async (e) => {
            const { top, left, width, height } = node.el.getBoundingClientRect()

            tooltipOpen.value = {
              x: left,
              y: top,
              width,
              height
            }

            if (tooltipText.value) {
              return
            }

            await new Promise((resolve) => setTimeout(resolve, 2000))

            tooltipText.value = `TITLE SET FOR ${props.item.user_username}`
          }

          node.props.onMouseout = async () => {
            tooltipOpen.value = null
          }

          node.props.style = {
            position: 'relative'
          }

          vueComponentApi.replaceSlot(node, 'default', (props, { originalSlot }) => {
            const nodes = originalSlot(props)

            nodes.push(renderTooltip(vueComponentApi, tooltipOpen, tooltipText))

            return nodes
          })

          return node
        }
      })
    })
  }

  async [MachineState.ON_LEAVE]() {
    log.info('SidebarStreamTooltip', 'Disabled.')

    const id = vueComponentApi.getComponentIdByName('CMUsername')

    if (id !== null) {
      vueComponentApi.restoreSetup(id)
    }
  }
}

export class SidebarStreamTooltipHooker extends Hooker {
  #sm = null

  async hook() {
    this.#sm = new Machine()
    this.#sm.pimp = this.pimp
    await this.#sm.start(new DisabledState())

    return {
      name: 'sidebarStreamTooltip',
      api: {
        setEnabled: (state) => {
          if (state) {
            this.#sm.next(new EnabledState())
          } else {
            this.#sm.next(new DisabledState())
          }
        }
      }
    }
  }

  unhook() {
  }
}
