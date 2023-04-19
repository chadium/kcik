import assert from 'assert'
import * as objectUtils from './object-utils.mjs'

it('pathsToValue: ignores null', async () => {
  let obj = {
    gamingmofo: null,
    gawbly: 'also cool',
  }

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    ['gawbly']
  ])
})

it('pathsToValue: ignores undefined', async () => {
  let obj = {
    gamingmofo: undefined,
    gawbly: 'also cool',
  }

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    ['gawbly']
  ])
})

it('pathsToValue: it finds value at root of object', async () => {
  let obj = {
    gamingmofo: 'cool',
    gawbly: 'also cool',
  }

  let result = objectUtils.pathsToValue(obj, 'cool')

  assert.strict.deepEqual(result, [
    ['gamingmofo']
  ])
})

it('pathsToValue: cant find value in root', async () => {
  let obj = {
    gamingmofo: 'cool',
    gawbly: 'also cool',
  }

  let result = objectUtils.pathsToValue(obj, 'uncool')

  assert.strict.deepEqual(result, [])
})

it('pathsToValue: finds nested value', async () => {
  let obj = {
    awesome: {
      gamingmofo: 'cool',
      gawbly: 'also cool',
    }
  }

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    ['awesome', 'gawbly']
  ])
})

it('pathsToValue: finds deeply nested value', async () => {
  let obj = {
    very: {
      awesome: {
        gamingmofo: 'cool',
        gawbly: 'also cool',
      }
    }
  }

  let result = objectUtils.pathsToValue(obj, 'cool')

  assert.strict.deepEqual(result, [
    ['very', 'awesome', 'gamingmofo']
  ])
})

it('pathsToValue: finds value in map', async () => {
  let obj = {
    awesome: new Map([
      ['gamingmofo', 'cool'],
      ['gawbly', 'also cool'],
    ])
  }

  let result = objectUtils.pathsToValue(obj, 'cool')

  assert.strict.deepEqual(result, [
    ['awesome', 'gamingmofo']
  ])
})

it('pathsToValue: finds nested value in map', async () => {
  let obj = {
    very: new Map([
      ['awesome', new Map([
        ['gamingmofo', 'cool'],
        ['gawbly', 'also cool'],
      ])]
    ])
  }

  let result = objectUtils.pathsToValue(obj, 'cool')

  assert.strict.deepEqual(result, [
    ['very', 'awesome', 'gamingmofo']
  ])
})

it('pathsToValue: finds value in symbol', async () => {
  let key = Symbol()

  let obj = {
    [key]: {
      gamingmofo: 'cool',
      gawbly: 'also cool',
    }
  }

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    [key, 'gawbly']
  ])
})

it('pathsToValue: finds value in array', async () => {
  let obj = ['cool', 'also cool']

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    ['1']
  ])
})

it('pathsToValue: finds value in an array nested in an object', async () => {
  let obj = {
    traits: ['cool', 'also cool']
  }

  let result = objectUtils.pathsToValue(obj, 'also cool')

  assert.strict.deepEqual(result, [
    ['traits', '1']
  ])
})
