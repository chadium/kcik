import assert from 'assert'
import { createTrackingFunction } from './test-utils.mjs'
import { ChatroomAuthentication } from './ChatroomAuthentication.mjs'

async function createAuthenticatedObject(expectedToken) {
  let auth = new ChatroomAuthentication({
    requestTimeout: 1,
    authSuccessTimeout: 1,
    masterportSend: async () => {
      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })
    
      await auth.masterportReceive({
        type: 'authSuccess',
        token: expectedToken
      })
    },
    chatroomSend: () => {}
  })

  await auth.fetch()

  return auth
}

describe('ChatroomAuthentication', () => {
  it('fetch: sends authRequest to masterport', async () => {
    const masterportSend = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      masterportSend
    })

    try {
      auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      assert.strict.deepEqual(masterportSend.tracker, [
        [
          {
            type: 'authRequest'
          }
        ]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('fetch: rejects if masterportSend throws error', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {
        throw new Error('Expected error')
      }
    })

    try {
      let promise = auth.fetch()

      assert.strict.rejects(promise)
    } finally {
      await auth.abort()
    }
  })

  it('fetch: expects to receive authRequestResponse from masterport so that it can send a chat room message', async () => {
    const chatroomSend = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend
    })

    try {
      auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      assert.strict.deepEqual(chatroomSend.tracker, [])

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      assert.strict.deepEqual(chatroomSend.tracker, [
        [123, JSON.stringify({
          type: 'auth',
          token: 'one-two-three'
        })]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('fetch: it rejects promise if chatroomSend throws error', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend: () => {
        throw new Error('Testing failure')
      }
    })

    try {
      let promise = auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      await assert.strict.rejects(promise)
    } finally {
      await auth.abort()
    }
  })

  it('fetch: throws error when auth request response takes too long', async () => {
    let auth = new ChatroomAuthentication({
      requestTimeout: 1,
      masterportSend: () => {}
    })

    try {
      let promise = auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      await assert.strict.rejects(promise)
    } finally {
      await auth.abort()
    }
  })

  it('fetch: will wait for authSuccess message and resolve', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend: () => {}
    })

    try {
      let promise = auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      await auth.masterportReceive({
        type: 'authSuccess',
        token: 'very-successful-token'
      })

      let result = await promise

      assert.strict.deepEqual(result, {
        token: 'very-successful-token'
      })
    } finally {
      await auth.abort()
    }
  })

  it('fetch: throws error when auth success takes too long', async () => {
    let auth = new ChatroomAuthentication({
      authSuccessTimeout: 1,
      masterportSend: () => {},
      chatroomSend: () => {}
    })

    try {
      let promise = auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      await assert.strict.rejects(promise)
    } finally {
      await auth.abort()
    }
  })

  it('fetch: bugfix: calling masterportReceive in chatroomSend will have the message sent to the wrong state', async () => {
    let auth = new ChatroomAuthentication({
      authSuccessTimeout: 1,
      masterportSend: () => {},
      chatroomSend: () => {
        auth.masterportReceive({
          type: 'authSuccess',
          token: 'very-successful-token'
        })
      }
    })

    try {
      let promise = auth.fetch()

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      let result = await promise

      assert.strict.deepEqual(result, {
        token: 'very-successful-token'
      })
    } finally {
      await auth.abort()
    }
  })

  it('use: will fetch token if token is not available', async () => {
    const masterportSend = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      masterportSend
    })

    try {
      auth.use(() => {})

      await new Promise((resolve) => setTimeout(resolve, 1))

      assert.strict.deepEqual(masterportSend.tracker, [
        [
          {
            type: 'authRequest'
          }
        ]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('use: will pass the token to the function after fetching it automatically for the first time', async () => {
    const useFn = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      requestTimeout: 1,
      authSuccessTimeout: 1,
      masterportSend: async () => {
        await auth.masterportReceive({
          type: 'authRequestResponse',
          token: 'one-two-three',
          chatroomId: 123
        })
      
        await auth.masterportReceive({
          type: 'authSuccess',
          token: 'the-token'
        })
      },
      chatroomSend: () => {}
    })

    try {
      await auth.use(useFn)

      assert.strict.deepEqual(useFn.tracker, [
        [
          {
            token: 'the-token'
          }
        ]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('use: will use existing token if already fetched', async () => {
    const useFn = createTrackingFunction()

    let auth = await createAuthenticatedObject('the-token')

    try {
      await auth.use(useFn)

      assert.strict.deepEqual(useFn.tracker, [
        [
          {
            token: 'the-token'
          }
        ]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('use: will fetch and call again if function throws error', async () => {
    let throws = true
    const useFn = createTrackingFunction(() => {
      if (throws) {
        throws = false
        throw new Error('Expected error')
      }
    })

    let auth = await createAuthenticatedObject('the-token')

    try {
      await auth.use(useFn)

      assert.strict.deepEqual(useFn.tracker, [
        [
          {
            token: 'the-token'
          }
        ],
        [
          {
            token: 'the-token'
          }
        ]
      ])
    } finally {
      await auth.abort()
    }
  })

  it('use: will fetch and call again if function throws error', async () => {
    const useFn = createTrackingFunction(() => {
      throw new Error('Expected error')
    })

    let auth = await createAuthenticatedObject('the-token')

    try {
      let promise = auth.use(useFn)

      await assert.strict.rejects(promise)

      assert.strict.deepEqual(useFn.tracker.length, 2)
    } finally {
      await auth.abort()
    }
  })
})
