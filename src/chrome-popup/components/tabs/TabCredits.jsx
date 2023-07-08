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
        THESE WONDERFUL PEOPLE HAVE
        MADE THE DEVELOPMENT OF
        THIS EXTENSION POSSIBLE
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

      <div className="text-center">
        Check <TextLink newTab={true} url="https://chadium.dev">https://chadium.dev</TextLink>
      </div>
    </div>
  )
}
