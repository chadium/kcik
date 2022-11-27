import { apiFetch } from './api-fetch.mjs'

export async function addKill(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-kill',
    bodyData: {
      name,
      amount
    }
  })
}

export async function addDeath(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-death',
    bodyData: {
      name,
      amount
    }
  })
}

export async function addScore(name, amount) {
  await apiFetch({
    method: 'POST',
    url: process.env.KIRKA_BOOMER_ADMIN_API_PREFIX + '/match/members/add-score',
    bodyData: {
      name,
      amount
    }
  })
}
