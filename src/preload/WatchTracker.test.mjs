import assert from 'assert'
import { WatchTracker } from './WatchTracker.mjs'

it('track: keeps track of timestamp for id', async () => {
  const wt = new WatchTracker();

  wt.track(1, 2, new Date('2024-01-15T00:07:58.591Z'))

  const timestamp = wt.remember(1)

  assert.strict.deepEqual(timestamp, 2)
})

it('remember: returns null if id was never tracked', async () => {
  const wt = new WatchTracker();

  const timestamp = wt.remember(1)

  assert.strict.deepEqual(timestamp, null)
})

it('remember: returns most recent timestamp', async () => {
  const wt = new WatchTracker();

  wt.track(1, 2, new Date('2024-01-14T00:07:58.591Z'))
  wt.track(1, 3, new Date('2024-01-15T00:07:58.591Z'))

  const timestamp = wt.remember(1)

  assert.strict.deepEqual(timestamp, 3)
})

it('clean: forgets timestamps before the given date', async () => {
  const wt = new WatchTracker();

  wt.track(1, 2, new Date('2024-01-14T00:07:58.591Z'))
  wt.track(2, 3, new Date('2024-01-15T00:07:58.591Z'))

  wt.clean(new Date('2024-01-14T12:00:00.00Z'))

  assert.strict.deepEqual(wt.remember(1), null)
  assert.strict.deepEqual(wt.remember(2), 3)
})
