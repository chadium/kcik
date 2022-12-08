import React, { useEffect } from 'react'
import styles from "./Flow.lazy.module.css"

export default function Flow({ children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={styles.locals.container}>{children}</div>
  )
}
