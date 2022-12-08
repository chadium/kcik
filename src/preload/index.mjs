import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { VueAppHooker } from './hookers/game/VueAppHooker.mjs'
import { RoomHooker } from './hookers/game/RoomHooker.mjs'
import { WorldMapHooker } from './hookers/game/WorldMapHooker.mjs'
import { MatchRankingHooker } from './hookers/custom-matches/MatchRankingHooker.mjs'
import { TagRankingHooker } from './hookers/custom-matches/TagRankingHooker.mjs'
import { JoinMatchHooker } from './hookers/electron/JoinMatchHooker.mjs'
import { PlayerHooker } from './hookers/game/PlayerHooker.mjs'
import { MatchHooker } from './hookers/game/MatchHooker.mjs'
import { SniffRoomMessagesHooker } from './hookers/game/SniffRoomMessagesHooker.mjs'
import { SoundHooker } from './hookers/game/SoundHooker.mjs'
import { KillBarHooker } from './hookers/game/KillBarHooker.mjs'
import { CreateCustomMatchHooker } from './hookers/electron/CreateCustomMatchHooker.mjs'
import { findValue, debugAccess } from './object-utils.mjs'
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

  let prompter = new Prompter()

  let pimp = new Pimp()

  let hookers = [
    new VueAppHooker(),
    new JoinMatchHooker(prompter),
    new WorldMapHooker(),
    new RoomHooker(),
    new MatchRankingHooker(),
    new TagRankingHooker(),
    new PlayerHooker(),
    new SoundHooker(),
    new KillBarHooker(),
    new MatchHooker(),
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
  window.findValue = findValue
  window.debugAccess = debugAccess
  window.pimp = pimp

  addEventListener('DOMContentLoaded', (event) => {
    styles.use()
  })
}

main().catch((e) => {
  log.bad('Index', e)
})
