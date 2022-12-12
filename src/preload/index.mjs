import { Messenger } from './Messenger.mjs'
import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { DomHooker } from './hookers/game/DomHooker.mjs'
import { VueAppHooker } from './hookers/game/VueAppHooker.mjs'
import { WorldHooker } from './hookers/game/WorldHooker.mjs'
import { RoomHooker } from './hookers/game/RoomHooker.mjs'
import { WorldMapHooker } from './hookers/game/WorldMapHooker.mjs'
import { LoadingHooker } from './hookers/electron/LoadingHooker.mjs'
import { JoinMatchHooker } from './hookers/electron/JoinMatchHooker.mjs'
import { PlayerHooker } from './hookers/game/PlayerHooker.mjs'
import { EntityComponentSystemHooker } from './hookers/game/EntityComponentSystemHooker.mjs'
import { MatchHooker } from './hookers/game/MatchHooker.mjs'
import { SniffRoomMessagesHooker } from './hookers/game/SniffRoomMessagesHooker.mjs'
import { SoundHooker } from './hookers/game/SoundHooker.mjs'
import { KillBarHooker } from './hookers/game/KillBarHooker.mjs'
import { CustomMatchDetectorHooker } from './hookers/custom-matches/CustomMatchDetectorHooker.mjs'
import { CreateCustomMatchHooker } from './hookers/electron/CreateCustomMatchHooker.mjs'
import { findKey, findValue, debugAccess } from './object-utils.mjs'
import * as log from './log.mjs'
import styles from "./global.lazy.css"


function patchSoftlock() {
  const original = Function.prototype.constructor
  Function.prototype.constructor = function (...args) {
    if (args[0] === 'debugger') {
      // No, I don't think so.
      return original.apply(this)
    }
  
    return original.apply(this, arguments)
  }
}

async function main() {
  patchSoftlock()

  let pimp = new Pimp()

  await pimp.register(new DomHooker())

  let prompter = new Prompter(pimp.getApi('dom').addElement())
  let messenger = new Messenger(pimp.getApi('dom').addElement())

  let hookers = [
    new VueAppHooker(),
    new LoadingHooker(),
    new EntityComponentSystemHooker(),
    new WorldHooker(),
    new WorldMapHooker(),
    new RoomHooker(),
    new JoinMatchHooker(prompter, messenger),
    new PlayerHooker(),
    new SoundHooker(),
    new KillBarHooker(),
    new MatchHooker(),
    new CustomMatchDetectorHooker(),
    new CreateCustomMatchHooker(),
    //new SniffRoomMessagesHooker(),
  ]

  for (let hooker of hookers) {
    try {
      await pimp.register(hooker)
    } catch (e) {
      log.bad('Index', 'Failed to register ' + hooker.constructor.name, e)
    }
  }

  // Useful tools.
  window.findKey = findKey
  window.findValue = findValue
  window.debugAccess = debugAccess
  window.pimp = pimp

  pimp.getApi('dom').on('headAvailable', () => {
    styles.use()
  })
}

main().catch((e) => {
  log.bad('Index', e)
})
