import React, { useEffect} from 'react'
import styles from "./PseudoButton.lazy.module.css"

export default function PseudoButton({ children, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <button className={[styles.locals.container].join(' ')} onClick={onClick}>
      {children}
      <div className={styles.locals.foreground}></div>
    </button>
  )
}
