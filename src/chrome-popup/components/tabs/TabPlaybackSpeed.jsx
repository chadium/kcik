import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabPlaybackSpeed({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableVodPlaybackSpeed(), [repo])
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
                await repo.setEnableVodPlaybackSpeed(value)
                com.mail('kcik.enableVodPlaybackSpeed', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Adds a button to the video player that allows you to
            change the playback speed. You can go up to 2x and
            down to 0.25x.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
