import React, { useEffect, useState, useMemo } from 'react'
import Dropdown from './Dropdown.jsx'
import styles from "./ComboBox.lazy.module.css"

export default function ComboBox({ options, value, onChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value)
  }, [options, value])
  const [showItems, setShowItems] = useState(false)

  function toggle() {
    setShowItems(!showItems)
  }

  function onShowChange(state) {
    setShowItems(state)
  }

  function selectItem(item) {
    setShowItems(false)

    if (onChange) {
      onChange(item.value)
    }
  }

  return (
    <div className={[styles.locals.container].join(' ')}>
      <label
        className={styles.locals.button}
        onClick={toggle}
      >
        {selectedOption ? (
          <div className={styles.locals.prompt}>{selectedOption.label}</div>
        ) : (
          <div className={styles.locals.prompt}>Select</div>
        )}

        <span className={styles.locals.arrow}>🡇</span>
      </label>

      <Dropdown show={showItems} onShowChange={onShowChange}>
        <div className={styles.locals.list}>
          {options.map((option, index) => (
            <div key={`${option.value}${index}`} className={[styles.locals.item, option.value === value ? styles.locals.selected : ''].join(' ')} onClick={selectItem.bind(null, option)}>
              {option.label}
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  )
}