import { Messenger } from './Messenger.mjs'
import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { DomHooker } from './hookers/game/DomHooker.mjs'
import { VueAppHooker } from './hookers/game/VueAppHooker.mjs'
import { UsernameColorFallbackHooker } from './hookers/mods/UsernameColorFallbackHooker.mjs'
import { pathsToKey, pathsToValue, breakOnSet, breakOnGet, freezeProperty } from './object-utils.mjs'
import * as log from './log.mjs'
import styles from "./global.lazy.css"

async function main() {
  let pimp = new Pimp()

  await pimp.register(new DomHooker())

  let hookers = [
    new VueAppHooker(),
    new UsernameColorFallbackHooker()
  ]

  for (let hooker of hookers) {
    try {
      await pimp.register(hooker)
    } catch (e) {
      log.bad('Index', 'Failed to register ' + hooker.constructor.name, e)
    }
  }

  // Useful tools.
  window.pathsToKey = pathsToKey
  window.pathsToValue = pathsToValue
  window.breakOnSet = breakOnSet
  window.breakOnGet = breakOnGet
  window.freezeProperty = freezeProperty
  window.pimp = pimp

  pimp.getApi('dom').on('headAvailable', () => {
    styles.use()
  })
}

main().catch((e) => {
  log.bad('Index', e)
})
