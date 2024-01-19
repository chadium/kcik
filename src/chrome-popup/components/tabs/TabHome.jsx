import React from 'react'
import TextLink from '../TextLink.jsx'

export default function TabHome({ com, repo }) {
  return (
    <div>
      <p>
        Use the navigation buttons up top to configure this extension
        to your liking.
      </p>

      <div className="chad-p-t"/>

      <p>
        <b>Changelog</b>:<br/>
        - <span className="chad-subtle">2024-01-20</span>: VOD player
        continues playing where you left off.<br/>
        - <span className="chad-subtle">2024-01-14</span>: Hide streamers in
        categories.<br/>
        - <span className="chad-subtle">2023-11-11</span>: Hide streamers in the
        sidebar.<br/>
        - <span className="chad-subtle">2023-10-10</span>: Send message history!
        Press up to get your previous message.<br/>
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
