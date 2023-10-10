import React from 'react'
import TextLink from '../TextLink.jsx'

export default function TabHome({ com, repo }) {
  return (
    <div>
      <p>
        Use the navigation buttons up top to configure the features
        of this extension to your liking.
      </p>

      <div className="chad-p-t"/>

      <p>
        <b>Changelog</b>:<br/>
        - <span className="chad-subtle">2023-10-10</span>: Send message history!
        Press up to get your previous message.<br/>
        - <span className="chad-subtle">2023-09-16</span>: Sidebar stream tooltip.
        See the stream title in the following and recommended lists.<br/>
        - <span className="chad-subtle">2023-08-26</span>: Playback speed control
        and current time display in clips and vods.<br/>
      </p>

      <div className="chad-p-t"/>

      <p>
        <strong>
          Found a bug? Tweet <TextLink newTab={true} url="https://twitter.com/adoseofhelpium">@adoseofhelpium</TextLink>
        </strong>
      </p>
    </div>
  )
}
