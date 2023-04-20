import React, { useState, useEffect } from 'react'
import GenericLoading from './GenericLoading.jsx'
import Page from './Page.jsx'
import TextLink from './TextLink.jsx'
import { useResource } from '../use-resource.mjs'
import "./Root.css"
import * as userApi from '../../preload/user-api.mjs'
import FormField from '../../preload/components/FormField.jsx'
import InputNumber from '../../preload/components/InputNumber.jsx'

export default function Root({ com }) {
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
    <Page
      footer={
        <div className="text-center">
          Check <TextLink newTab={true} url="https://chadium.dev">https://chadium.dev</TextLink>
        </div>
      }
    >
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
    </Page>
  )
}
