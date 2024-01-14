import React, { useEffect } from 'react'
import styles from './Page.lazy.module.css'

export default function Page({
  theme,
  children,
  header,
  footer,
  flexMode,
}) {
  useEffect(() => {
    styles.use()
  }, [])

  const themeClass = theme ? `bg-${theme}` : undefined

  const contentClasses = [styles.locals.content]

  if (flexMode) {
    contentClasses.push(styles.locals.contentFlexMode)
  }

  return (
    <div className={[styles.locals.container, themeClass].join(' ')}>
      <div className={styles.locals.header}>{header}</div>

      <div className={contentClasses.join(' ')}>
        {children}
      </div>

      <div className={styles.locals.footer}>{footer}</div>
    </div>
  )
}
