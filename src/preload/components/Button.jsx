import React, { useEffect} from 'react'
import styles from "./Button.lazy.module.css"

export default function Button({ theme = 'ok', children, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <button className={[styles.locals.container, `boomer-theme--${theme}`].join(' ')} onClick={onClick}>{children}</button>
  )
}
