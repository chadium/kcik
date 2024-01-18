import React, { useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabPlayPosition({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnablePlayPositions(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      {data !== null && (
        <div>
          <div>
            <InputCheck
              label="Enable"
              value={data}
              onChange={async (value) => {
                await repo.setEnablePlayPositions(value)
                com.mail('kcik.enablePlayPositions', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Whenever you watch a vod, close the tab and open it again,
            the video player will continue to play where you left off.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
