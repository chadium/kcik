import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabHost({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableHost(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      {data !== null && (
        <div>
          <div>
            <InputCheck
              label="Enable"
              value={!data}
              onChange={async (value) => {
                value = !value
                await repo.setEnableHost(value)
                com.send('kcik.enableHost', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Streamers can send their viewers to another channel
            to show their support. By enabling this, you can
            automatically reject hosts and never leave your favorite
            streamer's channel.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
