import React, { useState, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import ColorPickerSlider from '../ColorPickerSlider.jsx'
import { useResource } from '../../use-resource.mjs'
import InputCheck from '../InputCheck.jsx'

export default function TabWebsiteTheme({ com, repo }) {
  let [lastColor, setLastColor] = useState('#0b0e0f')
  let fetchResource = useCallback(() => repo.getWebsiteTheme(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      <FormField
        label={(
          <>
            <InputCheck
              value={data !== null}
              onChange={async (value) => {
                if (value) {
                  await repo.setWebsiteTheme({
                    mainColor: lastColor
                  })
                  com.send('kcik.websiteTheme', {
                    mainColor: lastColor
                  })
                  setData({
                    mainColor: lastColor
                  })
                } else {
                  await repo.setWebsiteTheme(null)
                  com.send('kcik.websiteTheme', null)
                  setData(null)
                }
              }}
            />

            Color
          </>
        )}
        control={data !== null && (
          <ColorPickerSlider
            value={data.mainColor}
            onChange={async (value) => {
              data.mainColor = value
              await repo.setWebsiteTheme(data)
              com.send('kcik.websiteTheme', data)
              setData(data)
              setLastColor(value)
            }}
          />
        )}
      />
    </GenericLoading>
  )
}
