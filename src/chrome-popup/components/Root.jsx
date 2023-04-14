import React, { useState, useEffect } from 'react'
import GenericLoading from './GenericLoading.jsx'
import Page from './Page.jsx'
import TextLink from './TextLink.jsx'
import { useResource } from '../use-resource.mjs'
import "./Root.css"
import * as userApi from '../../preload/user-api.mjs'

export default function Root() {
  return (
    <Page
      footer={
        <div className="text-center">
          Check <TextLink url="https://chadium.dev">https://chadium.dev</TextLink>
        </div>
      }
    >
      <div className="text-center">
        <div className="margin-bottom bold-and-strong">
          This is the ALPHA version of Chadium's kcik extension.
        </div>
        <div className="margin-bottom bold-and-strong">
          Its first feature allows you to set your username color.
          Type <code>!color red</code> in any chatroom to set your
          color to red, for example.
        </div>
        <div className="margin-bottom bold-and-strong">
          The development of this extension is being exclusively live streamed on kick.com!
        </div>
      </div>
    </Page>
  )
}
