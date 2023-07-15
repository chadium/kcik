import React, { useEffect, useState, useMemo } from 'react'
import styles from "./ExtendShrink.lazy.module.css"

export default function ExtendShrink({ children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return <div className={styles.locals.container}>{children}</div>
}
