import React, { useEffect, useMemo, useState } from 'react'
import styles from "./FormField.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss } from "../duration-format.mjs"

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
