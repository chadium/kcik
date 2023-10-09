import { Messenger } from './Messenger.mjs'
import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { PiniaHooker } from './hookers/game/PiniaHooker.mjs'
import { HideStreamersHooker } from './hookers/mods/HideStreamersHooker.mjs'
import { EchoHooker } from './hookers/game/EchoHooker.mjs'
import { DomHooker } from './hookers/game/DomHooker.mjs'
import { UserHooker } from './hookers/game/UserHooker.mjs'
import { VueAppHooker } from './hookers/game/VueAppHooker.mjs'
import { VueComponentHooker } from './hookers/game/VueComponentHooker.mjs'
import { VueRouteHooker } from './hookers/game/VueRouteHooker.mjs'
import { CredentialsHooker } from './hookers/game/CredentialsHooker.mjs'
import { ChatMessageDeletedHooker } from './hookers/mods/ChatMessageDeletedHooker.mjs'
import { UsernameColorVueComponentHooker } from './hookers/mods/UsernameColorVueComponentHooker.mjs'
import { StateHooker } from './hookers/mods/StateHooker.mjs'
import { ChromeExtensionHooker } from './hookers/mods/ChromeExtensionHooker.mjs'
import { FontSizeHooker } from './hookers/mods/FontSizeHooker.mjs'
import { HostStopperHooker } from './hookers/mods/HostStopperHooker.mjs'
import { WebsiteThemeHooker } from './hookers/mods/WebsiteThemeHooker.mjs'
import { ClipsHooker } from './hookers/mods/ClipsHooker.mjs'
import { VodPlaybackSpeedHooker } from './hookers/mods/VodPlaybackSpeedHooker.mjs'
import { VodMouseVolumeControlHooker } from './hookers/mods/VodMouseVolumeControlHooker.mjs'
import { VodCurrentTimeHookerHooker } from './hookers/mods/VodCurrentTimeHooker.mjs'
import { SidebarStreamTooltipHooker } from './hookers/mods/SidebarStreamTooltipHooker.mjs'
import * as snapshotUtils from './snapshot-utils.mjs'
import { pathsToKey, pathsToValue, breakOnSet, breakOnGet, freezeProperty, getByPath} from './object-utils.mjs'
import * as log from './log.mjs'
import styles from "./global.lazy.css"

async function main() {
  if (process.env.PRELOAD_DELAY) {
    const delay = Number(process.env.PRELOAD_DELAY)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  let pimp = new Pimp()

  let hookers = [
    new DomHooker(),
    new VueAppHooker(),
    new VueComponentHooker(),
    new PiniaHooker(),
    new EchoHooker(),
    new StateHooker(),
    new UserHooker(),
    new CredentialsHooker(),
    new UsernameColorVueComponentHooker(),
    new VueRouteHooker(),
    new WebsiteThemeHooker(),
    new FontSizeHooker(),
    new HostStopperHooker(),
    new ClipsHooker(),
    new HideStreamersHooker(),
    new VodMouseVolumeControlHooker(),
    new VodCurrentTimeHookerHooker(),
    new VodPlaybackSpeedHooker(),
    new SidebarStreamTooltipHooker(),
    new ChatMessageDeletedHooker(),
    new ChromeExtensionHooker(),
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
  window.getByPath = getByPath
  window.snapshotUtils = snapshotUtils
  window.pimp = pimp

  pimp.getApi('dom').on('headAvailable', () => {
    styles.use()
  })
}

main().catch((e) => {
  log.bad('Index', e)
})
