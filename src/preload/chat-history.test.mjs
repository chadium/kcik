import assert from 'assert'
import { ChatHistory } from './chat-history.mjs'

it('push: records message', async () => {
  const history = new ChatHistory()

  history.push('first')

  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'first')
})

it('push: records second message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'second')
})

it('push: removes oldest message', async () => {
  const history = new ChatHistory({
    limit: 2
  })

  history.push('first')
  history.push('second')
  history.push('third')

  {
    history.up()

    const message = history.get()

    assert.strict.deepEqual(message, 'third')
  }

  {
    history.up()

    const message = history.get()

    assert.strict.deepEqual(message, 'second')
  }

  {
    history.up()

    const message = history.get()

    assert.strict.deepEqual(message, 'second')
  }
})

it('get: returns null when not looking up history', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  const message = history.get()

  assert.strict.deepEqual(message, null)
})

it('get: returns looked up message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'second')
})

it('up: looks up most recent message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'second')
})

it('up: can look up previous message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()
  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'first')
})

it('up: does not move any further when reaching the oldest message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()
  history.up()
  history.up()

  const message = history.get()

  assert.strict.deepEqual(message, 'first')
})

it('down: can move to the next message', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()
  history.up()
  history.down()

  const message = history.get()

  assert.strict.deepEqual(message, 'second')
})

it('down: will not look up history when going past the bottom', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()
  history.down()

  const message = history.get()

  assert.strict.deepEqual(message, null)
})

it('bottom: moves past the bottom of the message stack', async () => {
  const history = new ChatHistory()

  history.push('first')
  history.push('second')

  history.up()
  history.up()
  history.bottom()

  {
    const message = history.get()

    assert.strict.deepEqual(message, null)
  }

  history.up()

  {
    const message = history.get()

    assert.strict.deepEqual(message, 'second')
  }
})

