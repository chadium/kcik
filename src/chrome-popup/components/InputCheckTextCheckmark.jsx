import React, { useEffect} from 'react'
import styles from "./InputCheckTextCheckmark.lazy.module.css"

export default function InputCheckTextCheckmark({
  children,
  tooltip,
  value,
  onChange
}) {
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
        value ? styles.locals.active : '',
      ].join(' ')}
      onClick={onClick}
      title={tooltip}
    >
      {children}
      <div
        className={[
          styles.locals.icon,
        ].join(' ')}
      >
        {value ? '✔️' : '🚫'}
      </div>
    </button>
  )
}
