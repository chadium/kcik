import React, { useEffect, useMemo, useState } from 'react'
import styles from "./FormField.lazy.module.css"

export default function FormField({ label, control }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={styles.locals.container}>
      {label && <div className={styles.locals.label}>{label}</div>}
      <div className={styles.locals.control}>{control}</div>
    </div>
  )
}
