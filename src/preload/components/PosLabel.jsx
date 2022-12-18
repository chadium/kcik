import React, { useEffect, useMemo } from 'react'
import styles from "./PosLabel.lazy.module.css"

export default function PosLabel({ position }) {
  useEffect(() => {
    styles.use()
  }, [])

  let posClass = useMemo(() => {
    if (position === 1) {
      return styles.locals.first
    } else if (position === 2) {
      return styles.locals.second
    } else if (position === 3) {
      return styles.locals.third
    } else {
      return ''
    }
  }, [position])

  return (
    <div className={[styles.locals.container, posClass].join(' ')}>
      {position}
    </div>
  )
}
