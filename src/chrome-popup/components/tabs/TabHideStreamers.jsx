import React, { useState, useEffect, useMemo, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import Button from '../Button.jsx'
import TextButton from '../TextButton.jsx'
import InputText from '../InputText.jsx'
import ExtendShrink from '../ExtendShrink.jsx'
import { useResource } from '../../use-resource.mjs'
import * as arrayUtils from '../../../preload/array-utils.mjs'
import { GroupListEditor } from '../../GroupListEditor.mjs'
import InputCheckTextCheckmark from '../InputCheckTextCheckmark.jsx'
import { BinarySortedArray } from '../../../preload/binary-sorted-array.mjs'
import FlexFlow from '../FlexFlow.jsx'

const groups = [
  'featured',
  'recommended',
  'category',
]

function AddForm({ onSave }) {
  let [name, setName] = useState('')

  function setNameSanitized(value) {
    setName(value)
  }

  function add() {
    const username = name.trim()
    if (username === '') {
      return
    }

    onSave({
      username
    })

    setName('')
  }

  return (
    <ExtendShrink>
      <InputText
        value={name}
        onChange={setNameSanitized}
      />
      <Button onClick={add}>Add</Button>
    </ExtendShrink>
  )
}

function NaughtyItem({ item, onAllow, onDisallow, onRemove }) {
  const letterByGroups = {
    featured: 'F',
    recommended: 'R',
    category: 'C',
  }
  const descriptionByGroups = {
    featured: {
      true: 'Blocked from appearing in the featured streams section of the home page.',
      false: 'Allowed to appear in the featured streams section of the home page.',
    },
    recommended: {
      true: 'Blocked from appearing in the recommended section of the sidebar.',
      false: 'Allowed to appear in the recommended section of the sidebar.',
    },
    category: {
      true: 'Blocked from appearing in the category listing.',
      false: 'Allowed to appear in the category listing.',
    },
  }

  return (
    <ExtendShrink>
      {item.groups.length > 0 ? (
        <div>{item.username}</div>
      ) : (
        <div className="chad-subtle chad-text-strike" title="Allowed in all sections. Will be removed from the list.">{item.username}</div>
      )}

      <FlexFlow multiplier={0.5}>
        {groups.map(g => (
          <InputCheckTextCheckmark
            key={g}
            tooltip={descriptionByGroups[g][item.groups.includes(g)]}
            value={!item.groups.includes(g)}
            onChange={(active) => {
              if (!active) {
                onAllow(g)
              } else {
                onDisallow(g)
              }
            }}
          >
            {letterByGroups[g]}
          </InputCheckTextCheckmark>
        ))}
      </FlexFlow>

      <TextButton onClick={onRemove}>❌</TextButton>
    </ExtendShrink>
  )
}

export default function TabHideStreamers({ com, repo }) {
  const editor = useMemo(() => new GroupListEditor({ groups }), [])
  const [naughtyList, setNaughtyList] = useState(new BinarySortedArray())
  let fetchResource = useCallback(() => {
    return repo.getHideStreamers()
  }, [repo])
  let { data, loading, error } = useResource(fetchResource)

  useEffect(() => {
    if (data === null) {
      return
    }

    editor.set(data)

    const comparator = (a, b) => a.username.localeCompare(b.username)

    setNaughtyList(new BinarySortedArray(editor.info(), comparator))
  }, [data])

  async function add({ username }) {
    if (naughtyList.includes(username)) {
      throw new Error('Name already in the naughty list.')
    }

    editor.add(username)

    const newData = editor.get()

    await repo.setHideStreamers(newData)
    com.mail('kcik.hideStreamers', newData)

    naughtyList.push({
      username,
      groups: groups.slice(),
    })

    setNaughtyList(naughtyList.clone())
  }

  async function allow(item, group) {
    editor.allow(item.username, group)

    const newData = editor.get()

    await repo.setHideStreamers(newData)
    com.mail('kcik.hideStreamers', newData)

    const index = naughtyList.indexOf(item)
    naughtyList.get(index).groups.push(group)

    setNaughtyList(naughtyList.clone())
  }

  async function disallow(item, group) {
    editor.disallow(item.username, group)

    const newData = editor.get()

    await repo.setHideStreamers(newData)
    com.mail('kcik.hideStreamers', newData)

    const index = naughtyList.indexOf(item)
    arrayUtils.removeFirstByValue(naughtyList.get(index).groups, group)

    setNaughtyList(naughtyList.clone())
  }

  async function remove(item) {
    editor.remove(item.username)

    const newData = editor.get()

    await repo.setHideStreamers(newData)
    com.mail('kcik.hideStreamers', newData)

    naughtyList.remove(item)

    setNaughtyList(naughtyList.clone())
  }

  return (
    <GenericLoading loading={loading} error={error}>
      <p>
        Type the name of a streamer in the box below then add them to the
        naughty list.
      </p>

      <div className="chad-p-t"></div>

      <AddForm onSave={add}/>

      <div className="chad-p-t"></div>
      <div className="chad-p-t"></div>

      <div>
        <center>Naughty List ({naughtyList.length})</center>

        {naughtyList.map((item) => (
          <div key={item.username}>
            <div className="chad-p-t"></div>
            <NaughtyItem
              item={item}
              onAllow={(group) => allow(item, group)}
              onDisallow={(group) => disallow(item, group)}
              onRemove={() => remove(item)}
            />
          </div>
        ))}
        {naughtyList.length === 0 && (
          <>
            <div className="chad-p-t"></div>
            <center>
              <b>Empty</b><br/>
              Everybody is nice.
            </center>
          </>
        )}
      </div>

      <div className="chad-p-t"></div>

      <p className="chad-text-small">
        <b>Note</b>: You will need to refresh the page when
        you add and remove streamers from the list.
      </p>
    </GenericLoading>
  )
}
