import React, { useState, useEffect } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import ColorPickerSlider from '../ColorPickerSlider.jsx'

export default function TabChatUsername({ com }) {
  let [usernameColor, setUsernameColor] = useState()

  useEffect(() => {
    com.on('kcik.usernameColor', setUsernameColor)
    return () => com.off('kcik.usernameColor', setUsernameColor)
  }, [com])

  useEffect(() => {
    com.send('kcik.ask', {
      fields: ['usernameColor']
    })
  }, [])

  return (
    <GenericLoading loading={usernameColor === undefined}>
      <div>
        <InputCheck
          label="Enable"
          value={usernameColor !== null}
          onChange={async (value) => {
            const color = value ? '#FFFFFF' : null

            setUsernameColor(color)
            com.send('kcik.usernameColor.set', color)
          }}
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

      <div className="chad-p-t"/>

      {usernameColor && (
        <FormField
          label="Choose color"
          control={
            <ColorPickerSlider
              value={usernameColor}
              onChange={(value) => {
                setUsernameColor(value)
                com.send('kcik.usernameColor.set', value)
              }}
            />
          }
        />
      )}
    </GenericLoading>
  )
}
