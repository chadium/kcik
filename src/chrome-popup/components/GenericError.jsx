import React from 'react'

export default function GenericError({ error }) {
  return <p className="bg-bad padding">{error.message}</p>
}
