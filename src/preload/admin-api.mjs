import { apiFetch } from './api-fetch.mjs'

export async function matchSet(regionId, roomId, type) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match',
    bodyData: {
      regionId,
      roomId,
      type
    }
  })
}

export async function matchEnd() {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/end'
  })
}

export async function teamDeathmatchAddKill(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-kill',
    bodyData: {
      name,
      amount
    }
  })
}

export async function teamDeathmatchAddDeath(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-death',
    bodyData: {
      name,
      amount
    }
  })
}

export async function teamDeathmatchAddScore(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-score',
    bodyData: {
      name,
      amount
    }
  })
}

export async function tagPlayerAdd(name) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/tag/players/add',
    bodyData: {
      name
    }
  })
}

export async function tagPlayerRemove(name) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/tag/players/remove',
    bodyData: {
      name
    }
  })
}

export async function tagSetIt(name) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/tag/players/it/set',
    bodyData: {
      name
    }
  })
}

export async function tagRemoveIt() {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/tag/players/it/remove'
  })
}

export async function tagReset() {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/tag/reset'
  })
}
