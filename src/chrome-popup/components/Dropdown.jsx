import React, { useEffect, useState, useMemo } from 'react'
import styles from "./Dropdown.lazy.module.css"

export default function Dropdown({ show, onShowChange, children }) {
  useEffect(() => {
    styles.use()
  }, [])

  let [el, setEl] = useState(null)

  useEffect(() => {
    let el = document.createElement('div')
    document.body.append(el)

    setEl(el)

    return () => {
      el.remove()
      setEl(null)
    }
  }, [])

  function onClickBackdrop() {
    if (onShowChange) {
      onShowChange(!show)
    }
  }

  if (show) {
    return (
      <>
        <div className={styles.locals.positionFixed}>{children}</div>
        <div className={styles.locals.container}>
          <div className={styles.locals.backdrop} onClick={onClickBackdrop}></div>
        </div>
      </>
    )
  } else {
    return <></>
  }
}
