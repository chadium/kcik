import React from 'react'

export default function TextLink({ children, url, newTab }) {
  return (
    <a
      className="text-link"
      href={url}
      rel="noopener noreferrer"
      target={newTab ? '_blank' : ''}
    >
      {children}
    </a>
  )
}
