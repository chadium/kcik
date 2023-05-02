import React, { useEffect } from 'react'
import styles from "./Arrow.lazy.module.css"

export default function Arrow({ direction }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <div className={[styles.locals.container, styles.locals[`direction--${direction}`]].join(' ')}></div>
  )
}
