import React from 'react'
import Page from './Page.jsx'
import LoadingDots from './LoadingDots.jsx'

export default function Loading() {
  return (
    <Page theme="neutral" flexMode>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoadingDots/>
      </div>
    </Page>
  )
}
