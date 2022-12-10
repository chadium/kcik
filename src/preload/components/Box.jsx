import React, { useEffect } from 'react'
import styles from "./Box.lazy.module.css"

export default function Box({ children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={[styles.locals.container].join(' ')}>
      <div className={styles.locals.bg}></div>
      {children}
    </div>
  )
}
