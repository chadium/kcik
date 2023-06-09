import https from 'https'

export async function httpRequest({
  method = 'GET',
  url,
  body
}) {
  return new Promise((resolve, reject) => {
    url = new URL(url)

    const options = {
      method,
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
    }

    const callback = (response) => {
      const b = []

      response.on('data', (c) => {
        b.push(c)
      })

      response.on('end', () => {
        resolve({
          body: Buffer.concat(b)
        })
      })
    }

    const req = https.request(options, callback)

    req.on('error', reject)

    if (body) {
      req.write(body)
    }

    req.end()
  })
}
