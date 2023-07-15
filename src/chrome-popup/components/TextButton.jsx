import React, { useEffect } from 'react'
import styles from "./TextButton.lazy.module.css"

export default function TextButton({ children, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <button
      className={styles.locals.container}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
