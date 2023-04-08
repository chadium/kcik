import ReconnectingWebSocket from 'reconnecting-websocket'
import { apiFetch } from './api-fetch.mjs'

export async function listColors() {
  let { data } = await apiFetch({
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/list-colors'
  })

  return data.data
}

export async function setColor({ username, color }) {
  await apiFetch({
    method: 'POST',
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/set-color',
    bodyData: {
      username,
      color
    }
  })
}

export function ws({ onNewColor }) {
  const socket = new ReconnectingWebSocket(`${process.env.BACKEND_API_WS_PREFIX}/v1/masterport`);

  socket.addEventListener('open', () => {
  })

  socket.addEventListener('message', ({ data }) => {
    // TODO
  });

  return {
    close() {
      socket.close()
    }
  }
}
