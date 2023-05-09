import React, { useState, useEffect } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
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
      <FormField
        label="Color"
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
    </GenericLoading>
  )
}
