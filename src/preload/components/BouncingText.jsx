import React, { useEffect, useMemo } from 'react'
import styles from "./BouncingText.lazy.module.css"

export default function BouncingText({ text }) {
  useEffect(() => {
    styles.use()
  }, [])

  let letters = useMemo(() => {
    return text.split('')
  }, [text])

  let l = letters.length * 0.2

  return (
    <div className={[styles.locals.container].join(' ')} style={{ '--l': `${l}s` }}>
      {letters.map((l, i) => (
        <span key={i} style={{ '--i': i }}>{l}</span>
      ))}
    </div>
  )
}
