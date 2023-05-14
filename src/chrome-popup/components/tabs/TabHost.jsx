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
          <p>Streamers can send their viewers to another channel
            to show their support. You can opt out of hosts:.</p>

          <div className="boomer-p-t"></div>

          <div>
            <InputCheck
              label="Ignore hosting"
              value={!data}
              onChange={async (value) => {
                value = !value
                await repo.setEnableHost(value)
                com.send('kcik.enableHost', value)
                setData(value)
              }}
            />
          </div>
        </div>
      )}
    </GenericLoading>
  )
}
