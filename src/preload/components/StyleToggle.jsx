import React from 'react'

export default function StyleToggle({ styles, enabled }) {
  return (
    <style>
      {Object.entries(styles).map(([name, css]) => (
        <React.Fragment key={name}>{enabled[name] ? css : ''}</React.Fragment>
      ))}
    </style>
  )
}
