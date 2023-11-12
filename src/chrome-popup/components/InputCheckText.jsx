import React, { useEffect} from 'react'
import styles from "./InputCheckText.lazy.module.css"

export default function InputCheckText({ children, tooltip, value, onChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  function onClick() {
    if (!onChange) {
      return
    }

    onChange(!value)
  }

  return (
    <button
      className={[
        styles.locals.container,
        `chad-theme--ok`,
        value ? styles.locals.active : ''
      ].join(' ')}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </button>
  )
}
