import React, { useEffect, useMemo } from 'react'
import styles from './InputText.lazy.module.css'
 
export default function InputText({ placeholder, value, onChange, onBlur }) {
  useEffect(() => {
    styles.use()
  }, [])

  const nativeOnChange = useMemo(() => (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }, [onChange])

  const nativeOnBlur = useMemo(() => (e) => {
    if (onBlur) {
      onBlur(e.target.value)
    }
  }, [onBlur])

  return (
    <div className={styles.locals.container}>
      <input placeholder={placeholder} type="text" value={value} onChange={nativeOnChange}  onBlur={nativeOnBlur}/>
    </div>
  );
}
