import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabSidebarStreamTooltip({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableSidebarStreamTooltip(), [repo])
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
                await repo.setEnableSidebarStreamTooltip(value)
                com.mail('kcik.enableSidebarStreamTooltip', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Lets you see the title of the stream when you place your mouse
            over a streamer in the sidebar.
          </p>

          <div className="chad-p-t"></div>

          <p className="chad-text-small">
            <b>Note</b>: You will need to refresh the page when
            you enable and disable this feature.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
