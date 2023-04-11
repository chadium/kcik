
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
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(bodyData)
  }

  try {
    let request = new XMLHttpRequest();
    request.open(method, url)
    for (let [name, value] of Object.entries(headers)) {
      request.setRequestHeader(name, value)
    }
    request.send(body)

    let response = await new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        if (request.readyState === request.DONE) {
          resolve({
            status: request.status,
            ok: request.status >= 200 && request.status <= 299,
            headers: {
              get(name) {
                return request.getResponseHeader(name)
              }
            },
            text: request.responseText,
            async json() {
              return JSON.parse(request.responseText)
            }
          })
        }
      }
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
