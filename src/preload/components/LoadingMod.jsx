import React, { useEffect, useMemo } from 'react'
import styles from "./LoadingMod.lazy.module.css"

export default function LoadingMod({ show }) {
  useEffect(() => {
    styles.use()
  }, [])

  if (!show) {
    return <></>
  }

  return (
    <div className={[styles.locals.container, 'boomer-text-shadow'].join(' ')}>
      Loading...
    </div>
  )
}
