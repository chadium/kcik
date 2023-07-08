import React, { useState, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import ColorPickerSlider from '../ColorPickerSlider.jsx'
import { useResource } from '../../use-resource.mjs'
import InputCheck from '../InputCheck.jsx'

export default function TabWebsiteTheme({ com, repo }) {
  let [lastWebsiteTheme, setLastWebsiteTheme] = useState({
    mainColor: '#0b0e0f',
    complementaryColor: '#53fc18'
  })
  let fetchResource = useCallback(async () => {
    let data = await repo.getWebsiteTheme()
    if (data !== null) {
      setLastWebsiteTheme(data)
    }
    return data
  }, [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      <InputCheck
        label="Enable"
        value={data !== null}
        onChange={async (value) => {
          if (value) {
            await repo.setWebsiteTheme(lastWebsiteTheme)
            com.send('kcik.websiteTheme', lastWebsiteTheme)
            setData(lastWebsiteTheme)
          } else {
            setLastWebsiteTheme(data)
            await repo.setWebsiteTheme(null)
            com.send('kcik.websiteTheme', null)
            setData(null)
          }
        }}
      />

      <div className="boomer-p-t"></div>

      <p>
        You can customize the color of the website.
        When you turn this on, below will appear some color pickers.
        You can review your changes in real time.
      </p>

      <div className="boomer-p-t"></div>
      <div className="boomer-p-t"></div>

      {data !== null && (
        <>
          <FormField
            label={(
              <>
                Main Color
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
                }}
              />
            )}
          />
    
          <div className="boomer-p-t"></div>
          <div className="boomer-p-t"></div>
    
          <FormField
            label={(
              <>
                Complementary Color
              </>
            )}
            control={data !== null && (
              <ColorPickerSlider
                value={data.complementaryColor}
                onChange={async (value) => {
                  data.complementaryColor = value
                  await repo.setWebsiteTheme(data)
                  com.send('kcik.websiteTheme', data)
                  setData(data)
                }}
              />
            )}
          />
        </>
      )}
    </GenericLoading>
  )
}
