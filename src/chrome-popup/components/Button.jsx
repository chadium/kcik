import React, { useEffect} from 'react'
import styles from "./Button.lazy.module.css"

export default function Button({ theme = 'ok', children, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <button className={[styles.locals.container, `chad-theme--${theme}`].join(' ')} onClick={onClick}>
      {children}
      <div className={styles.locals.foreground}></div>
    </button>
  )
}
