import ReconnectingWebSocket from 'reconnecting-websocket'

export class RequestError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class RequestUnknownError extends RequestError {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export class RequestServerError extends RequestError {
  constructor(message, data) {
    super(message)
    this.name = this.constructor.name
    this.data = data
  }
}

export class RequestClientError extends RequestError {
  constructor(message, data) {
    super(message)
    this.name = this.constructor.name
    this.data = data
  }
}

async function request({
  method = 'GET',
  path,
  headers,
  query,
  queryData,
  bodyData
}) {
  if (queryData) {
    if (!query) {
      query = {}
    }

    query.d = JSON.stringify(queryData)
  }

  let url = process.env.KIRKA_BOOMER_USER_API_PREFIX + path

  try {
    let response = await fetch(url, {
      method,
      headers,
      keepalive: false,
      //mode: 'no-cors'
    })

    if (response.ok) {
      if (response.headers.get('content-type') === 'application/json') {
        return {
          data: await response.json()
        }
      } else {
        throw new RequestUnknownError('Unknown content type')
      }
    } else {
      if (response.status === 0) {
        throw new RequestUnknownError('Unable to perform request.')
      } else if (response.status === 400) {
        throw new RequestClientError('TODO', {})
      } else {
        throw new RequestServerError('TODO', {})
      }
    }
  } catch (e) {
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new RequestUnknownError('Unable to fetch')
    } else {
      throw e
    }
  }
}

export async function getRanking() {
  let { data } = await request({
    path: '/match/ranking'
  })

  return data.ranking
}

export async function wsRanking({ onConnect, onUpdate }) {
  const socket = new ReconnectingWebSocket(`${process.env.KIRKA_BOOMER_USER_WS_API_PREFIX}/match/ranking`);

  socket.addEventListener('open', () => {
    console.log('open')
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
