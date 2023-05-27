import assert from 'assert'
import { StupidMap } from './StupidMap.mjs'

it('set: returns associated value', async () => {
  let key = {
    gamingmofo: null,
    gawbly: 'cool',
    wallop: 'also cool'
  }

  let map = new StupidMap()

  map.set(key, 1)

  let result = map.get(key)

  assert.strict.deepEqual(result, 1)
})

it('set: replaces existing value', async () => {
  let key = {
    gamingmofo: null,
    gawbly: 'cool',
    wallop: 'also cool'
  }

  let map = new StupidMap()

  map.set(key, 1)
  map.set(key, 2)

  let result = map.get(key)

  assert.strict.deepEqual(result, 2)
})

it('set: interpret key by reference', async () => {
  let key1 = {
    gamingmofo: null,
    gawbly: 'cool',
    wallop: 'also cool'
  }

  let key2 = {
    gamingmofo: null,
    gawbly: 'cool',
    wallop: 'also cool'
  }

  let map = new StupidMap()

  map.set(key2, 2)
  map.set(key1, 1)

  let result1 = map.get(key1)

  assert.strict.deepEqual(result1, 1)

  let result2 = map.get(key2)

  assert.strict.deepEqual(result2, 2)
})

it('get: returns undefined whem map is empty', async () => {
  let map = new StupidMap()

  let result = map.get('does not exist')

  assert.strict.deepEqual(result, undefined)
})

it('get: returns undefined whem key does not exist in non-empty map', async () => {
  let map = new StupidMap()

  map.set('does exist', 1)

  let result = map.get('does not exist')

  assert.strict.deepEqual(result, undefined)
})
