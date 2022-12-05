import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { VueAppHooker } from './hookers/VueAppHooker.mjs'
import { RoomHooker } from './hookers/RoomHooker.mjs'
import { WorldMapHooker } from './hookers/WorldMapHooker.mjs'
import { MatchRankingHooker } from './hookers/MatchRankingHooker.mjs'
import { TagRankingHooker } from './hookers/TagRankingHooker.mjs'
import { JoinMatchHooker } from './hookers/JoinMatchHooker.mjs'
import { PlayerHooker } from './hookers/PlayerHooker.mjs'
import { MatchHooker } from './hookers/MatchHooker.mjs'
import { CustomTeamDeathMatchHooker } from './hookers/CustomTeamDeathMatchHooker.mjs'
import { CustomTagMatchHooker } from './hookers/CustomTagMatchHooker.mjs'
import { SniffRoomMessagesHooker } from './hookers/SniffRoomMessagesHooker.mjs'
import { KillBarHooker } from './hookers/KillBarHooker.mjs'
import { findValue, debugAccess } from './object-utils.mjs'
import * as log from './log.mjs'

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
    new KillBarHooker(),
    new MatchHooker(),
    new CustomTeamDeathMatchHooker(),
    new CustomTagMatchHooker(),
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
}

main().catch((e) => {
  log.bad('Index', e)
})
