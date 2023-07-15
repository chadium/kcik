import React, { useState, useEffect, useMemo, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import Button from '../Button.jsx'
import TextButton from '../TextButton.jsx'
import InputText from '../InputText.jsx'
import ExtendShrink from '../ExtendShrink.jsx'
import { useResource } from '../../use-resource.mjs'
import * as arrayUtils from '../../../preload/array-utils.mjs'

function AddForm({ onSave }) {
  let [name, setName] = useState('')

  function add() {
    if (name === '') {
      return
    }

    onSave({
      name
    })

    setName('')
  }

  return (
    <ExtendShrink>
      <InputText
        value={name}
        onChange={setName}
      />
      <Button onClick={add}>Add</Button>
    </ExtendShrink>
  )
}

function NaughtyItem({ name, onRemove }) {
  return (
    <ExtendShrink>
      <div>{name}</div>
      <TextButton onClick={onRemove}>❌</TextButton>
    </ExtendShrink>
  )
}

export default function TabHideStreamers({ com, repo }) {
  let fetchResource = useCallback(() => repo.getHideStreamers(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  let naughtyList = useMemo(() => {
    if (!data) {
      return []
    }

    return data.featured
  }, [data])

  async function add({ name }) {
    if (naughtyList.includes(name)) {
      throw new Error('Name already in the naughty list.')
    }

    let newData = {
      featured: data.featured.concat()
    }

    newData.featured.push(name)

    await repo.setHideStreamers(newData)
    com.send('kcik.hideStreamers', newData)
    setData(newData)
  }

  async function remove(name) {
    let newData = {
      featured: data.featured.concat()
    }

    arrayUtils.removeFirstByValue(newData.featured, name)

    await repo.setHideStreamers(newData)
    com.send('kcik.hideStreamers', newData)
    setData(newData)
  }

  return (
    <GenericLoading loading={loading} error={error}>
      <p>
        You can hide streamers from the Featured Streams
        section of the front page. Type their name in the
        box below and add them to the naughty list.
      </p>

      <div className="chad-p-t"></div>

      <AddForm onSave={add}/>

      <div className="chad-p-t"></div>
      <div className="chad-p-t"></div>

      <div>
        <center>Naughty List</center>


        {naughtyList.map((name) => (
          <>
            <div className="chad-p-t"></div>
            <NaughtyItem name={name} onRemove={() => remove(name)}/>
          </>
        ))}
        {naughtyList.length === 0 && (
          <>
            <div className="chad-p-t"></div>
            <center>Empty. Everybody is nice.</center>
          </>
        )}
      </div>
    </GenericLoading>
  )
}
