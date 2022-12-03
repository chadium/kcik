const https = require('https');
const { DynamicBuffer } = require('dynamic-buffer/lib')

exports.httpRequest = async function httpRequest({
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
      const b = new DynamicBuffer();

      response.on('data', (c) => {
        // I imported this library because I thought it would be capable of appending buffers.
        // Turns out, it only accepts strings... The concatenation operator is in theory more
        // efficient than this then. I need to make my own dynamic buffer.
        b.append(c.toString())
      })

      response.on('end', () => {
        resolve({
          body: b.toBuffer()
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
