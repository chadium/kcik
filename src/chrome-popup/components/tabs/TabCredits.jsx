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
        This extension is developed LIVE on kick.com!
      </div>

      <div className="chad-p-t"/>

      <strong>
        <TextLink newTab={true} url="https://kick.com/chadium">https://kick.com/chadium</TextLink>
      </strong>

      <div className="chad-p-t"/>

      <div>
        I'd like to thank the following people for supporting mr streamer:
      </div>

      <div className="chad-p-t"/>

      <GenericLoading loading={loading} error={error}>
        {data && (
          <div>
            <div>Kick Subscribers:</div>
            <div>
              {data.kickSubscribers.map(username => (
                <div key={username}>
                  <strong><based><legend>{username}</legend></based></strong>
                </div>
              ))}
            </div>

            <div className="chad-p-t"/>

            <div>Ko-Fi Supporters:</div>
            <div>
              {data.kofiSupporters.map(name => (
                <div key={name}>
                  <strong><based><legend>{name}</legend></based></strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </GenericLoading>

      <div className="chad-p-t"/>

      <p>
        More about the author of this extension:
      </p>

      <div className="chad-p-t"/>

      <TextLink newTab={true} url="https://chadium.dev">https://chadium.dev</TextLink>
    </div>
  )
}
