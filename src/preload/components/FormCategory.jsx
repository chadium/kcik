import React, { useEffect, useMemo, useState } from 'react'
import styles from "./FormCategory.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss } from "../duration-format.mjs"

export default function FormCategory({ label, children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={styles.locals.container}>
      <div className={styles.locals.label}>{label}</div>
      <div className={styles.locals.content}>{children}</div>
    </div>
  )
}
