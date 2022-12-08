import React, { useEffect, useState, useMemo } from 'react'
import { usePopper } from 'react-popper';
import styles from "./ComboBox.lazy.module.css"

export default function ComboBox({ options, value, onChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  const selectedOption = useMemo(() => {
    return options.find(o => o.value === value)
  }, [options, value])

  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const [showItems, setShowItems] = useState(false)

  const { state: popperState, update: popperUpdate, styles: popperStyles, attributes: popperAttributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'arrow',
        options: { element: arrowElement }
      }
    ]
  })

  useEffect(() => {
    function onClick(e) {
      if (e.target === referenceElement
        || e.target === popperElement) {
        return
      }

      hide()
    }

    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [showItems])

  function toggle() {
    setShowItems(!showItems)
  }

  function show() {
    setShowItems(true)

    // // Enable the event listeners
    // popperInstance.setOptions((options) => ({
    //   ...options,
    //   modifiers: [
    //     ...options.modifiers,
    //     { name: 'eventListeners', enabled: true },
    //   ],
    // }))
  
    // Update its position
    popperInstance.update()
  }

  function hide() {
    setShowItems(false)

    // // Disable the event listeners
    // popperInstance.setOptions((options) => ({
    //   ...options,
    //   modifiers: [
    //     ...options.modifiers,
    //     { name: 'eventListeners', enabled: false },
    //   ],
    // }))
  }

  function selectItem(item) {
    hide()

    if (onChange) {
      onChange(item.value)
    }
  }

  return (
    <div className={[styles.locals.container].join(' ')}>
      <label
        className={styles.locals.button}
        ref={setReferenceElement}
        onClick={toggle}
      >
        {selectedOption ? (
          <div className={styles.locals.prompt}>{selectedOption.label}</div>
        ) : (
          <div className={styles.locals.prompt}>Select</div>
        )}

        <span className={styles.locals.arrow}>🡇</span>
      </label>

      <div
        className={styles.locals.list}
        ref={setPopperElement}
        style={{ ...popperStyles.popper, display: showItems ? 'block' : 'none' }}
        {...popperAttributes.popper}
      >
        {options.map((option, index) => (
          <div key={`${option.value}${index}`} className={[styles.locals.item, option.value === value ? styles.locals.selected : ''].join(' ')} onClick={selectItem.bind(null, option)}>
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}