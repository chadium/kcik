import React, { useState, useEffect } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputNumber from '../InputNumber.jsx'

export default function TabChatFont({ com }) {
  let [fontSize, setFontSize] = useState()

  useEffect(() => {
    com.on('kcik.fontSize', setFontSize)
    return () => com.off('kcik.fontSize', setFontSize)
  }, [com])

  useEffect(() => {
    com.send('kcik.ask', {
      fields: ['fontSize']
    })
  }, [])

  return (
    <GenericLoading loading={fontSize === undefined}>
      <FormField
        label="Font size"
        control={
          <InputNumber
            value={fontSize}
            onChange={(value) => {
              setFontSize(value)
              com.send('kcik.fontSize.set', value)
            }}
          />
        }
      />
    </GenericLoading>
  )
}
