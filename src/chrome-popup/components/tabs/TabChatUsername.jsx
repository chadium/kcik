import React, { useState, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import ColorPickerSlider from '../ColorPickerSlider.jsx'
import { useResource } from '../../use-resource.mjs'

function Content({ data, com, setData }) {
  let [enabled, setEnabled] = useState(data !== null)
  let [color, setColor] = useState(data !== null ? data : '#FFFFFF')

  async function onChangeEnabled(value) {
    if (value) {
      await com.request('kcik.usernameColor.set', {
        color
      })
    } else {
      await com.request('kcik.usernameColor.set', {
        color: null
      })
      setData(null)
    }

    setEnabled(value)
  }

  async function onChangeColor(color) {
    await com.request('kcik.usernameColor.set', {
      color
    })
    setColor(color)
  }

  return (
    <>
      <div>
        <InputCheck
          label="Enable"
          value={enabled}
          onChange={onChangeEnabled}
        />
      </div>

      <div className="chad-p-t"/>

      <div>
        The website only provides 14 colors but with the
        extension you're able to pick any color.
        Anyone using the extension will see this color
        for your username in chat. Users without the
        extension will see the color you set in the website.
      </div>

      {enabled && (
        <>
          <div className="chad-p-t"/>

          <FormField
            label="Choose color"
            control={
              <ColorPickerSlider
                value={color}
                onChange={onChangeColor}
              />
            }
          />
        </>
      )}
    </>
  )
}

export default function TabChatUsername({ com }) {
  let fetchResource = useCallback(() => com.request('kcik.usernameColor.get'), [com])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      {!loading && (
        <Content data={data} setData={setData} com={com}/>
      )}
    </GenericLoading>
  )
}
