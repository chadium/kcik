import React, { useState, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import ColorPickerSlider from '../ColorPickerSlider.jsx'
import { useResource } from '../../use-resource.mjs'
import InputCheck from '../InputCheck.jsx'
import Flow from '../Flow.jsx'
import deepEqual from 'deep-equal'

const presets = [
  {
    name: 'Adin Rouge',
    websiteTheme: {
      mainColor: '#470000',
      complementaryColor: '#810707'
    } 
  },
  {
    name: 'Dark Ninja',
    websiteTheme: {
      mainColor: '#020004',
      complementaryColor: '#217dba'
    }
  },
  {
    name: 'Ice Pissaidon',
    websiteTheme: {
      mainColor: '#DFB2FF',
      complementaryColor: '#bc20b1'
    } 
  },
  {
    name: 'Sus Pandas',
    websiteTheme: {
      mainColor: '#ffffff',
      complementaryColor: '#000000'
    }
  },
  {
    name: 'Fauzy Tube',
    websiteTheme: {
      mainColor: '#d9d9d9',
      complementaryColor: '#cd14d7'
    }
  },
  {
    name: 'Amouranth Hair',
    websiteTheme: {
      mainColor: '#e08300',
      complementaryColor: '#fff2b8'
    }
  },
  {
    name: 'Deepak',
    websiteTheme: {
      mainColor: '#191715',
      complementaryColor: '#ff9600'
    }
  },
  {
    name: 'Green',
    websiteTheme: {
      mainColor: '#003c50',
      complementaryColor: '#c71616'
    }
  },
  {
    name: 'Inverse',
    websiteTheme: {
      mainColor: '#53fc18',
      complementaryColor: '#0b0e0f'
    }
  }
]

function PresetOption({ name, websiteTheme, selected, onSelect }) {
  const style = {
    backgroundColor: websiteTheme.mainColor,
    width: '21px',
    height: '21px',
    display: 'inline-block',
    borderRadius: 'var(--chad-border-radius)',
    border: 'var(--chad-control-border)'
  }

  if (selected) {
    style.borderColor = 'var(--chad-highlight-color)'
  } else {
    style.cursor = 'pointer'
  }
  
  function onNativeClick(e) {
    if (selected) {
      // Do nothing.
      return
    }

    if (onSelect) {
      onSelect(websiteTheme)
    }
  }

  return (
    <span style={style} title={name} onClick={onNativeClick}></span>
  )
}

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
            com.mail('kcik.websiteTheme', lastWebsiteTheme)
            setData(lastWebsiteTheme)
          } else {
            setLastWebsiteTheme(data)
            await repo.setWebsiteTheme(null)
            com.mail('kcik.websiteTheme', null)
            setData(null)
          }
        }}
      />

      <div className="chad-p-t"></div>

      <p>
        Customize the color of the website. Select between presets
        or tune shades to your liking.
      </p>

      <div className="chad-p-t"></div>
      <div className="chad-p-t"></div>

      {data !== null && (
        <>
          <FormField
            label={(
              <>
                Presets
              </>
            )}
            control={data !== null && (
              <Flow>
                {presets.map(p => (
                  <PresetOption
                    key={p.name}
                    name={p.name}
                    websiteTheme={p.websiteTheme}
                    selected={deepEqual(p.websiteTheme, data)}
                    onSelect={async (websiteTheme) => {
                      await repo.setWebsiteTheme(websiteTheme)
                      com.mail('kcik.websiteTheme', websiteTheme)
                      setData(websiteTheme)
                    }}
                  />
                ))}
              </Flow>
            )}
          />

          <div className="chad-p-t"></div>
          <hr/>
          <div className="chad-p-t"></div>

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
                  com.mail('kcik.websiteTheme', data)
                  setData(data)
                }}
              />
            )}
          />
    
          <div className="chad-p-t"></div>
          <div className="chad-p-t"></div>
    
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
                  com.mail('kcik.websiteTheme', data)
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
