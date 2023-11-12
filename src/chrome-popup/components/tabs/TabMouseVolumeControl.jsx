import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import FormField from '../FormField.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'

export default function TabMouseVolumeControl({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableVodMouseVolumeControl(), [repo])
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
                await repo.setEnableVodMouseVolumeControl(value)
                com.send('kcik.enableVodMouseVolumeControl', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <ul>
            <li><b>Middle mouse click</b>: mute/unmute video</li>
            <li><b>Scroll wheel</b>: increase/decrease volume</li>
          </ul>

          <div className="chad-p-t"></div>

          <p className="chad-text-small">
            <b>Note</b>: browsers have a security policy in place that prevents
            websites from automatically playing unmuted videos. Due to this,
            you may have seen that kick will sometimes play streams with the
            audio muted. Scrolling will not unmute the video because
            browser policies require that the user (you) interact with
            the page first. Clicking counts as an interaction, therefore
            the middle mouse button can be used to unmute the stream.
          </p>

          <div className="chad-p-t"></div>

          <p className="chad-text-small">
            <b>Note 2</b>: you will not be able to scroll down the page when your mouse
            is on top of the video player. Move your mouse out of the video
            player to be able to scroll.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
