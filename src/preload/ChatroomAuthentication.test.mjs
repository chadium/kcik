import assert from 'assert'
import { createTrackingFunction } from './test-utils.mjs'
import { ChatroomAuthentication } from './ChatroomAuthentication.mjs'

describe('ChatroomAuthentication', () => {
  it('start: sends authRequest to masterport', async () => {
    const masterportSend = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      masterportSend
    })

    try {
      auth.start('gawbly')

      await new Promise((resolve) => setTimeout(resolve, 1))

      assert.strict.deepEqual(masterportSend.tracker, [
        [
          {
            type: 'authRequest',
            username: 'gawbly'
          }
        ]
      ])
    } finally {
      await auth.stop()
    }
  })

  it('start: rejects if masterportSend throws error', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {
        throw new Error('Expected error')
      }
    })

    try {
      let promise = auth.start('gawbly')

      assert.strict.rejects(promise)
    } finally {
      await auth.stop()
    }
  })
  it('start: expects to receive authRequestResponse from masterport so that it can send a chat room message', async () => {
    const chatroomSend = createTrackingFunction()

    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend
    })

    try {
      auth.start('juliuspringlejp')

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
      await auth.stop()
    }
  })

  it('start: it rejects promise if chatroomSend throws error', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend: () => {
        throw new Error('Testing failure')
      }
    })

    try {
      let promise = auth.start('juliuspringlejp')

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      await assert.strict.rejects(promise)
    } finally {
      await auth.stop()
    }
  })

  it('start: throws error when auth request response takes too long', async () => {
    let auth = new ChatroomAuthentication({
      requestTimeout: 1,
      masterportSend: () => {}
    })

    try {
      let promise = auth.start('juliuspringlejp')

      await new Promise((resolve) => setTimeout(resolve, 1))

      await assert.strict.rejects(promise)
    } finally {
      await auth.stop()
    }
  })

  it('start: will wait for authSuccess message and resolve', async () => {
    let auth = new ChatroomAuthentication({
      masterportSend: () => {},
      chatroomSend: () => {}
    })

    try {
      let promise = auth.start('juliuspringlejp')

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
      await auth.stop()
    }
  })

  it('start: throws error when auth success takes too long', async () => {
    let auth = new ChatroomAuthentication({
      authSuccessTimeout: 1,
      masterportSend: () => {},
      chatroomSend: () => {}
    })

    try {
      let promise = auth.start('juliuspringlejp')

      await new Promise((resolve) => setTimeout(resolve, 1))

      await auth.masterportReceive({
        type: 'authRequestResponse',
        token: 'one-two-three',
        chatroomId: 123
      })

      await assert.strict.rejects(promise)
    } finally {
      await auth.stop()
    }
  })
})
