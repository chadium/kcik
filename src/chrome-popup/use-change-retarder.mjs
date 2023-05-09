import { useState, useEffect, useCallback, useRef } from "react"

export function useChangeRetarder(value, onChange) {
  let [timer, setTimer] = useState(null)
  let originals = useRef({
    currentValue: value
  })

  originals.current.value = value
  originals.current.onChange = onChange

  useEffect(() => {
    originals.current.currentValue = value
  }, [value])

  let onCurrentChange = useCallback((newValue) => {
    originals.current.currentValue = newValue

    if (timer) {
      clearTimeout(timer)
    }

    setTimer(setTimeout(() => {
      if (originals.current.value !== originals.current.currentValue) {
        onChange(originals.current.currentValue)
      }

      setTimer(null)
    }, 500))
  }, [onChange, timer])

  return { 
    currentValue: originals.current.currentValue,
    onCurrentChange,
  }
}