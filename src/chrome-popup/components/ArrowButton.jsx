import React, { useEffect } from 'react'
import styles from "./ArrowButton.lazy.module.css"
import PseudoButton from './PseudoButton.jsx'
import Arrow from './Arrow.jsx'

export default function ArrowButton({ direction, onClick }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <PseudoButton onClick={onClick}>
      <div className={styles.locals.container}>
        <Arrow direction={direction}/>
      </div>
    </PseudoButton>
  )
}

