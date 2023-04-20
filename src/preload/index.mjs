import { Messenger } from './Messenger.mjs'
import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { DomHooker } from './hookers/game/DomHooker.mjs'
import { UserHooker } from './hookers/game/UserHooker.mjs'
import { VueAppHooker } from './hookers/game/VueAppHooker.mjs'
import { DomChatMessageHooker } from './hookers/game/DomChatMessageHooker.mjs'
import { CredentialsHooker } from './hookers/game/CredentialsHooker.mjs'
import { UsernameColorFallbackHooker } from './hookers/mods/UsernameColorFallbackHooker.mjs'
import { UsernameSetColorFallbackHooker } from './hookers/mods/UsernameSetColorFallbackHooker.mjs'
import { StateHooker } from './hookers/mods/StateHooker.mjs'
import { ChromePopupHooker } from './hookers/mods/ChromePopupHooker.mjs'
import { FontSizeHooker } from './hookers/mods/FontSizeHooker.mjs'
import { pathsToKey, pathsToValue, breakOnSet, breakOnGet, freezeProperty } from './object-utils.mjs'
import * as log from './log.mjs'
import styles from "./global.lazy.css"

async function main() {
  let pimp = new Pimp()

  await pimp.register(new DomHooker())

  let hookers = [
    new VueAppHooker(),
    new StateHooker(),
    new UserHooker(),
    new CredentialsHooker(),
    new DomChatMessageHooker(),
    new UsernameColorFallbackHooker(),
    new UsernameSetColorFallbackHooker(),
    new ChromePopupHooker(),
    new FontSizeHooker(),
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
