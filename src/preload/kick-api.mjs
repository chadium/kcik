import { apiFetch } from './api-fetch.mjs'

export async function sendChatMessage({
  chatroomId,
  message,
  authToken
}) {
  let reactions = []
  let emotes = []
  let createdAt = Math.floor(Date.now() / 1000)
  let id = `temp_${Date.now()}`

  await apiFetch({
    method: "POST",
    url: 'https://kick.com/api/v1/chat-messages',
    headers: {
      authorization: `Bearer ${authToken}`,
      'x-xsrf-token': authToken
    },
    bodyData: {
      chatroom_id: chatroomId,
      type: null,
      message,
      created_at: createdAt,
      id,
      reactions,
      emotes
    }
  })
}
