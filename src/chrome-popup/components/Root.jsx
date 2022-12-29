import React, { useState, useEffect } from 'react'
import GenericLoading from './GenericLoading.jsx'
import Page from './Page.jsx'
import TextLink from './TextLink.jsx'
import { useResource } from '../use-resource.mjs'
import "./Root.css"
import { matchGet } from '../../preload/user-api.mjs'

async function fetchMatch() {
  return {
    match: await matchGet()
  }
}

export default function Root() {
  let { loading, data, error } = useResource(fetchMatch)

  return (
    <GenericLoading loading={loading} error={error}>
      {data && (
        <Page
          theme={data.match ? 'good' : 'warn'}
          footer={
            <div className="text-center">
              Check <TextLink url="https://the28yearoldboomer.com">the28yearoldboomer.com</TextLink>
            </div>
          }
        >
          {data.match ? (
            <div className="text-center">
              <div className="margin-bottom text-big">
                👍
              </div>
              <div className="margin-bottom bold-and-strong">the28yearoldboomer is live!</div>

              <div className="margin-bottom">
                Go to the stream<br/>
                if you'd like to join!
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="margin-bottom text-big">
                👎
              </div>
              <div className="margin-bottom bold-and-strong">
                the28yearoldboomer is <br/>
                not playing kirka.io
              </div>
            </div>
          )}
        </Page>
      )}
    </GenericLoading>
  )
}
