import React from 'react'
import TextLink from '../TextLink.jsx'

export default function TabHome({ com, repo }) {
  return (
    <div>
      <p>
        Use the navigation buttons up top to configure the features
        of this extension to your liking.
      </p>

      <br/>

      <p>
        <b>Changelog</b>:<br/>
        - <span className="chad-subtle">2023-07-30</span>: You can now display deleted messages.<br/>
        - <span className="chad-subtle">2023-07-16</span>: You can now remove streamers from the
        Featured Streams section of the home page.
      </p>
    </div>
  )
}
