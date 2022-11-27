import ReconnectingWebSocket from 'reconnecting-websocket'
import { apiFetch } from './api-fetch.mjs'

export async function getRanking() {
  let { data } = await apiFetch({
    url: process.env.KIRKA_BOOMER_USER_API_PREFIX + '/match/ranking'
  })

  return data.ranking
}

export async function wsRanking({ onConnect, onUpdate }) {
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
