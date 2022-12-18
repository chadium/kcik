import { useEffect, useMemo, useState } from 'react'

export function useTimeUpdate(callback, condition, dependencies = [condition]) {
  const [lastResult, setLastResult] = useState()

  useEffect(() => {
    if (!condition) {
      return
    }

    function onUpdate() {
      setLastResult(callback())
    }

    onUpdate()

    let id = setInterval(onUpdate, 1000)

    return () => clearInterval(id)
  }, [dependencies])

  return lastResult
}
