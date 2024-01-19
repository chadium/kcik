import React, { useState, useEffect, useMemo } from 'react'
import { CSSTransition } from 'react-transition-group'
import ArrowButton from './ArrowButton.jsx'
import styles from "./ArrowNavigation.lazy.module.css"

export default function ArrowNavigation({ tabIndex, tabs, onTabIndexChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  const [direction, setDirection] = useState('right')
  const activeTab = tabs[tabIndex]

  function moveLeft() {
    tabIndex -= 1

    if (tabIndex < 0) {
      tabIndex = tabs.length - 1
    }

    setDirection('right')
    onTabIndexChange(tabIndex)
  }

  function moveRight() {
    tabIndex += 1

    if (tabIndex >= tabs.length) {
      tabIndex = 0
    }

    setDirection('left')
    onTabIndexChange(tabIndex)
  }

  return (
    <div className={styles.locals.container}>
      <ArrowButton direction="left" onClick={moveLeft}></ArrowButton>

      <div className={styles.locals.selected}>
        {tabs.map((tab) => (
          <CSSTransition
            key={tab.name}
            in={tab === activeTab}
            timeout={100}
            classNames={`slide-${direction}`}
            unmountOnExit
          >
            <div className={styles.locals.selectedText}>{tab.name}</div>
          </CSSTransition>
        ))}
      </div>

      <ArrowButton direction="right" onClick={moveRight}></ArrowButton>
    </div>
  )
}
