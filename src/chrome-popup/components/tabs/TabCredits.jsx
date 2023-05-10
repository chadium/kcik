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

      <div className="boomer-p-t"/>

      <GenericLoading loading={loading} error={error}>
        {data && (
          <div>
            {data.kickSubscribers.map(username => (
              <div key={username}>
                {username}
              </div>
            ))}
          </div>
        )}
      </GenericLoading>

      <div className="boomer-p-t"/>

      <div className="text-center">
        Check <TextLink newTab={true} url="https://chadium.dev">https://chadium.dev</TextLink>
      </div>
    </div>
  )
}
