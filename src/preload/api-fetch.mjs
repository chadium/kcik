
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

export async function apiFetch({
  method = 'GET',
  url,
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

  if (!headers) {
    headers = {}
  }

  let body


  if (bodyData) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = `d=${encodeURIComponent(JSON.stringify(bodyData))}`
  }

  try {
    let response = await fetch(url, {
      method,
      headers,
      body,
      keepalive: false
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
