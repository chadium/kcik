import React, { useEffect, useMemo, useState } from 'react'
import Box from "./Box.jsx"
import Button from "./Button.jsx"
import styles from './ModalBox.lazy.module.css'

export default function ModalBox({ variant = 'slim', show, showClose = true, onClose, title, children }) {
  useEffect(() => {
    styles.use()
  }, [])

  if (!show) {
    return <></>
  }

  return (
    <div className={[styles.locals.container, styles.locals[`variant--${variant}`]].join(' ')}>
      <Box>
        <div className={styles.locals.inner}>
          {showClose && (
            <div className={styles.locals.close}><Button onClick={onClose}>X</Button></div>
          )}

          {title && (
            <div className={styles.locals.title}>
              {title}
            </div>
          )}

          <div className={styles.locals.content}>
            {children}
          </div>
        </div>
      </Box>
    </div>
  )
}
