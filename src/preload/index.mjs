import { Pimp } from './Pimp.mjs'
import { MatchHooker } from './hookers/MatchHooker.mjs'

let { contextBridge } = require('electron')

async function main() {
  let pimp = new Pimp()

  await pimp.register(new MatchHooker())
  
  let matchApi = pimp.getApi('match')

  setInterval(() => {
    console.log(matchApi.getPlayers())
  }, 1000)
}

main().catch(console.error)
