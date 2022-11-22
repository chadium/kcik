import React, { useEffect} from 'react'
import styles from "./Button.lazy.css"

export default function Button({ children, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <button onClick={onClick}>{children}</button>
  )
}
