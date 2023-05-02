import React, { useEffect } from 'react'
import styles from './Page.lazy.module.css'

export default function Page({ theme, children, header, footer }) {
  useEffect(() => {
    styles.use()
  }, [])

  const themeClass = theme ? `bg-${theme}` : undefined

  return (
    <div className={[styles.locals.container, themeClass].join(' ')}>
      <div className={styles.locals.header}>{header}</div>

      <div className={styles.locals.content}>
        {children}
      </div>

      <div className={styles.locals.footer}>{footer}</div>
    </div>
  )
}
