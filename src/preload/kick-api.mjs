import { apiFetch } from './api-fetch.mjs'

export async function sendChatMessage({
  chatroomId,
  message,
  authToken
}) {
  await apiFetch({
    method: "POST",
    url: 'https://kick.com/api/v2/messages/send/' + encodeURIComponent(chatroomId),
    headers: {
      authorization: `Bearer ${authToken}`,
      'x-xsrf-token': authToken
    },
    bodyData: {
      type: 'message',
      content: message
    }
  })
}
