import ReconnectingWebSocket from 'reconnecting-websocket'
import { apiFetch } from './api-fetch.mjs'

export async function getMatchRanking() {
  let { data } = await apiFetch({
    url: process.env.KIRKA_BOOMER_USER_API_PREFIX + '/match/ranking'
  })

  return data.ranking
}

export async function getTagRanking() {
  let { data } = await apiFetch({
    url: process.env.KIRKA_BOOMER_USER_API_PREFIX + '/tag/ranking'
  })

  return data.ranking
}

export async function tagGetIt() {
  let { data } = await apiFetch({
    url: process.env.KIRKA_BOOMER_USER_API_PREFIX + '/tag/players/it'
  })

  return data.it
}

export async function wsMatchRanking({ onConnect, onUpdate }) {
  const socket = new ReconnectingWebSocket(`${process.env.KIRKA_BOOMER_USER_WS_API_PREFIX}/match/ranking`);

  socket.addEventListener('open', () => {
    onConnect()
  })

  socket.addEventListener('message', ({ data }) => {
    onUpdate(JSON.parse(data))
  });

  return {
    close() {
      socket.close()
    }
  }
}

export async function wsTagRanking({ onConnect, onUpdate }) {
  const socket = new ReconnectingWebSocket(`${process.env.KIRKA_BOOMER_USER_WS_API_PREFIX}/tag/ranking`);

  socket.addEventListener('open', () => {
    onConnect()
  })

  socket.addEventListener('message', ({ data }) => {
    onUpdate(JSON.parse(data))
  });

  return {
    close() {
      socket.close()
    }
  }
}

export async function wsTagIt({ onConnect, onUpdate }) {
  const socket = new ReconnectingWebSocket(`${process.env.KIRKA_BOOMER_USER_WS_API_PREFIX}/tag/players/it`);

  socket.addEventListener('open', () => {
    onConnect()
  })

  socket.addEventListener('message', ({ data }) => {
    onUpdate(JSON.parse(data))
  });

  return {
    close() {
      socket.close()
    }
  }
}
