import React, { useEffect } from 'react'
import styles from "./Box.lazy.css"

export default function Box({ children }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className="box">
      {children}
    </div>
  )
}
