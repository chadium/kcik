import assert from 'assert'
import * as mapUtils from './map-utils.mjs'

it('waitForSet: returns promise that resolves to value that is passed to set', async () => {
  let map = new Map()

  let promise = mapUtils.waitForSet(map, 'key')

  map.set('key', 'value')

  let value = await promise

  assert.strict.deepEqual(value, 'value')
})

it('waitForSet: promises are reused', async () => {
  let map = new Map()

  let promise1 = mapUtils.waitForSet(map, 'key')
  let promise2 = mapUtils.waitForSet(map, 'key')

  map.set('key', 'value')

  let value1 = await promise1
  let value2 = await promise2

  assert.strict.deepEqual(value1, 'value')
  assert.strict.deepEqual(value2, 'value')
})

it('waitForSet: promises resolve to corresponding value', async () => {
  let map = new Map()

  let promise1 = mapUtils.waitForSet(map, 'key1')
  let promise2 = mapUtils.waitForSet(map, 'key2')

  map.set('key1', 'value1')
  map.set('key2', 'value2')

  let value1 = await promise1
  let value2 = await promise2

  assert.strict.deepEqual(value1, 'value1')
  assert.strict.deepEqual(value2, 'value2')
})
