import React, { useEffect, useMemo } from 'react'
import styles from './InputCheck.lazy.module.css'
 
export default function InputCheck({ label, value, onChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  const nativeOnChange = useMemo(() => (e) => {
    if (onChange) {
      onChange(e.target.checked)
    }
  }, [onChange])

  return (
    <label className={styles.locals.container}>
      <input type="checkbox" checked={value} onChange={nativeOnChange}/>
      <span className={['boomer-theme--ok', styles.locals.check, value ? styles.locals.checked : styles.locals.unchecked].join(' ')}></span>
      {label && <span className={styles.locals.label}>{label}</span>}
    </label>
  );
}
