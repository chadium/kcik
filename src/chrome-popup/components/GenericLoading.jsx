import React from 'react'
import GenericError from './GenericError.jsx'
import LoadingDots from './LoadingDots.jsx'

function DefaultLoading() {
  return <div className="text-center"><LoadingDots/></div>
}

export default function GenericLoading({ loading, error, LoadingComponent = DefaultLoading, ErrorComponent = GenericError, children }) {
  return (
    <>
      {loading ? (
        <LoadingComponent/>
      ) : (
        error ? (
          <ErrorComponent error={error}/>
        ) : (
          children
        )
      )}
    </>
  )
}
