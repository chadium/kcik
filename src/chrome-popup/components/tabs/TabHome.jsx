import React from 'react'
import TextLink from '../TextLink.jsx'

export default function TabHome({ com, repo }) {
  return (
    <div>
      <p>
        Use the navigation buttons up top to configure the features
        of this extension to your liking.
      </p>

      <br />

      <p>
        KCIK is a chrome extension for kick.com developed LIVE and
        exclusively on kick.com!
      </p>

      <br />

      <p>
        <b>New experimental feature</b>:<br/>
        Website color! You can now change the color of the
        website. This is very much work in progress but it
        is released in this version for you to play around!
      </p>
    </div>
  )
}
