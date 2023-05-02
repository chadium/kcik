import React, { useState, useEffect, useMemo } from 'react'
import ArrowButton from './ArrowButton.jsx'
import styles from "./ArrowNavigation.lazy.module.css"

export default function ArrowNavigation({ tabIndex, tabs, onTabIndexChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  const activeTab = tabs[tabIndex]

  function moveLeft() {
    tabIndex -= 1

    if (tabIndex < 0) {
      tabIndex = tabs.length - 1
    }

    onTabIndexChange(tabIndex)
  }

  function moveRight() {
    tabIndex += 1

    if (tabIndex >= tabs.length) {
      tabIndex = 0
    }

    onTabIndexChange(tabIndex)
  }

  return (
    <div className={styles.locals.container}>
      <ArrowButton direction="left" onClick={moveLeft}></ArrowButton>
      <div className={styles.locals.selected}>{activeTab.name}</div>
      <ArrowButton direction="right" onClick={moveRight}></ArrowButton>
    </div>
  )
}
