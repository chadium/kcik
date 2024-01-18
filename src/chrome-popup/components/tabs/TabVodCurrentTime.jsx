import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabVodCurrentTime({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableVodCurrentTime(), [repo])
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
                await repo.setEnableVodCurrentTime(value)
                com.mail('kcik.enableVodCurrentTime', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Instead of displaying the remaining time in a video, you
            will see the current time. In other words, displays
            how far you are into the video instead of how much there
            is left to the end.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
