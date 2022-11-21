import { Pimp } from './Pimp.mjs'
import { RoomHooker } from './hookers/RoomHooker.mjs'
import { WorldHooker } from './hookers/WorldHooker.mjs'
import { SquadScoreHooker } from './hookers/SquadScoreHooker.mjs'

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

  await pimp.register(new WorldHooker())
  await pimp.register(new RoomHooker())
  await pimp.register(new SquadScoreHooker())

  try {
    let matchApi = pimp.getApi('match')

    matchApi.on('match-join', ({ players }) => {
      console.log('Joined match', players)
    })
  } catch (e) {
    console.error(e)
  }

  window.pimp = pimp
}

main().catch(console.error)
