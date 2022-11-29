import { Prompter } from './Prompter.mjs'
import { Pimp } from './Pimp.mjs'
import { RoomHooker } from './hookers/RoomHooker.mjs'
import { MysteryObjectHooker } from './hookers/MysteryObjectHooker.mjs'
import { WorldMapHooker } from './hookers/WorldMapHooker.mjs'
import { MatchRankingHooker } from './hookers/MatchRankingHooker.mjs'
import { TagRankingHooker } from './hookers/TagRankingHooker.mjs'
import { JoinMatchHooker } from './hookers/JoinMatchHooker.mjs'
import { PlayerHooker } from './hookers/PlayerHooker.mjs'
import { MatchHooker } from './hookers/MatchHooker.mjs'
import { CustomTeamDeathMatchHooker } from './hookers/CustomTeamDeathMatchHooker.mjs'

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
    new JoinMatchHooker(prompter),
    new MysteryObjectHooker(),
    new WorldMapHooker(),
    new RoomHooker(),
    new MatchRankingHooker(),
    new TagRankingHooker(),
    new PlayerHooker(),
    new MatchHooker(),
    new CustomTeamDeathMatchHooker(),
  ]

  for (let hooker of hookers) {
    try {
      await pimp.register(hooker)
    } catch (e) {
      console.error('Failed to register ' + hooker.constructor.name, e)
    }
  }

  window.pimp = pimp
}

main().catch(console.error)
