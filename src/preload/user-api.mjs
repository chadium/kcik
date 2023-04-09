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

export async function authStart({ username }) {
  let { data } = await apiFetch({
    method: 'POST',
    url: process.env.BACKEND_API_HTTP_PREFIX + '/v1/auth/start',
    bodyData: {
      username
    }
  })

  return {
    token: data.token,
    chatroomId: data.chatroomId
  }
}

export function masterport({ onNewUserColor }) {
  const socket = new ReconnectingWebSocket(`${process.env.BACKEND_API_WS_PREFIX}/v1/masterport`);

  socket.addEventListener('open', () => {
  })

  socket.addEventListener('message', ({ data }) => {
    data = JSON.parse(data)

    switch (data.type) {
      case 'newUserColor':
        if (onNewUserColor) {
          onNewUserColor({
            username: data.username,
            timestamp: data.timestamp,
            color: data.color
          })
        }
        break

      default:
        break
    }
  });

  return {
    close() {
      socket.close()
    }
  }
}
