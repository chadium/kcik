import React, { useState, useEffect } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import { useResource } from '../../use-resource.mjs'
import TextLink from '../TextLink.jsx'
import * as userApi from '../../../preload/user-api.mjs'

export default function TabCredits({ com }) {
  let { data, loading, error } = useResource(userApi.credits)

  return (
    <div>
      <div>
        This is developed LIVE on kick.com. My channel:
      </div>

      <strong>
        <TextLink newTab={true} url="https://kick.com/chadium">https://kick.com/chadium</TextLink>
      </strong>

      <div className="chad-p-t"/>

      <GenericLoading loading={loading} error={error}>
        {data && (
          <>
            {(data.kickSubscribers.length > 0 || data.kofiSupporters.length > 0) && (
              <div>
                I'd like to thank the following people for supporting mr streamer:
              </div>
            )}

            {data.kickSubscribers.length > 0 && (
              <>
                <div className="chad-p-t"/>
                <div>Kick Subscribers &amp; Gifters:</div>
                <div>
                  {data.kickSubscribers.map(username => (
                    <div key={username}>
                      <strong><based><legend>{username}</legend></based></strong>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.kofiSupporters.length > 0 && (
              <>
                <div className="chad-p-t"/>
                <div>Ko-Fi Supporters:</div>
                <div>
                  {data.kofiSupporters.map(name => (
                    <div key={name}>
                      <strong><based><legend>{name}</legend></based></strong>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </GenericLoading>

      <div className="chad-p-t"/>

      <p>Learn more about me:</p>

      <TextLink newTab={true} url="https://chadium.dev">https://chadium.dev</TextLink>
    </div>
  )
}
