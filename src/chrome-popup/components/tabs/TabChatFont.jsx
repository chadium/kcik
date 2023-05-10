import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputNumber from '../InputNumber.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabChatFont({ com, repo }) {
  let fetchResource = useCallback(() => repo.getFontSize(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  // useEffect(() => {
  //   com.on('kcik.fontSize', setFontSize)
  //   return () => com.off('kcik.fontSize', setFontSize)
  // }, [com])

  useEffect(() => {
    // com.send('kcik.ask', {
    //   fields: ['fontSize']
    // })
  }, [])

  return (
    <GenericLoading loading={loading} error={error}>
      {data !== null && <FormField
        label="Font size"
        control={
          <InputNumber
            value={data}
            onChange={async (value) => {
              await repo.setFontSize(value)
              com.send('kcik.fontSize', value)
              setData(value)
            }}
          />
        }
      />}
    </GenericLoading>
  )
}
