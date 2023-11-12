import assert from 'assert'
import { GroupListEditor } from './GroupListEditor.mjs'

const groups = [
  'featured',
  'recommended',
]

it('add: adds user to all lists', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['otheruser'],
    recommended: []
  })

  editor.add('testuser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['otheruser', 'testuser'],
    recommended: ['testuser'],
  })
})

it('add: adds user that already exists in some lists to the other lists', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['otheruser'],
    recommended: ['testuser']
  })

  editor.add('testuser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['otheruser', 'testuser'],
    recommended: ['testuser'],
  })
})

it('add: does nothing if user is in all lists', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['otheruser'],
    recommended: ['testuser']
  })

  editor.add('testuser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['otheruser', 'testuser'],
    recommended: ['testuser'],
  })
})

it('remove: removes user from all lists', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.remove('testuser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['otheruser'],
    recommended: [],
  })
})

it('remove: removes user from remaining lists', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.remove('otheruser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser'],
    recommended: ['testuser'],
  })
})

it('remove: does nothing if user is not in any list', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.remove('unknownuser')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })
})

it('allow: adds user to a specific group', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.allow('another', 'recommended')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser', 'another'],
  })
})

it('allow: does nothing if user is already in a group', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.allow('testuser', 'recommended')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })
})

it('disallow: removes user from a specific group', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.disallow('testuser', 'recommended')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: [],
  })
})

it('disallow: does nothing if user is not in the group', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.disallow('someotheruser', 'recommended')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })
})

it('disallow: does not remove user from unrelated group', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  editor.disallow('otheruser', 'recommended')

  assert.strict.deepEqual(editor.get(), {
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })
})

it('getByUsername: maps usernames to groups', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  const map = editor.getByUsername()

  assert.strict.deepEqual(map, {
    testuser: {
      featured: true,
      recommended: true
    },
    otheruser: {
      featured: true,
      recommended: false
    },
  })
})

it('info: shows groups associated to users', async () => {
  const editor = new GroupListEditor({ groups })

  editor.set({
    featured: ['testuser', 'otheruser'],
    recommended: ['testuser'],
  })

  const list = editor.info()

  assert.strict.deepEqual(list, [
    {
      username: 'testuser',
      groups: ['featured', 'recommended'],
    },
    {
      username: 'otheruser',
      groups: ['featured'],
    },
  ])
})
