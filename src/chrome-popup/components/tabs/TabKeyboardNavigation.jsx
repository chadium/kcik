import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabKeyboardNavigation({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableVodKeyboardNavigation(), [repo])
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
                await repo.setEnableVodKeyboardNavigation(value)
                com.send('kcik.enableVodKeyboardNavigation', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Kick supports keyboard navigation for vods but not clips.
            Enabling this adds keyboard navigation to clips.
          </p>

          <div className="chad-p-t"></div>

          <ul>
            <li><b>Space bar</b>: pause/play video</li>
            <li><b>Left arrow</b>: go back 5 seconds</li>
            <li><b>Right arrow</b>: go forward 5 seconds</li>
          </ul>
        </div>
      )}
    </GenericLoading>
  )
}
