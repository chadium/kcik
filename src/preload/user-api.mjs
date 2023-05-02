import ReconnectingWebSocket from 'reconnecting-websocket'
import { apiFetch } from './api-fetch.mjs'

export async function listColors() {
  let { data } = await apiFetch({
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/list-colors'
  })

  return data.data
}

export async function setColor({ token, color }) {
  await apiFetch({
    method: 'POST',
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/set-color',
    bodyData: {
      token,
      color
    }
  })
}

export async function credits() {
  let { data } = await apiFetch({
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/wonderful-people'
  })

  return data
}

export function masterport({ onMessage }) {
  const socket = new ReconnectingWebSocket(`${process.env.BACKEND_API_WS_PREFIX}/v1/masterport`);

  socket.addEventListener('open', () => {
  })

  socket.addEventListener('message', ({ data }) => {
    data = JSON.parse(data)

    onMessage(data)
  });

  return {
    send(message) {
      socket.send(JSON.stringify(message))
    },

    close() {
      socket.close()
    }
  }
}
