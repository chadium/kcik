import React, { useEffect } from 'react'
import styles from "./Train.lazy.module.css"

export default function Train({ children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={styles.locals.container}>{children}</div>
  )
}
