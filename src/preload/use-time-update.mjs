import { useEffect, useMemo, useState } from 'react'

export function useTimeUpdate(callback, condition) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!condition) {
      return
    }

    let id = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    setNow(Date.now())

    return () => clearInterval(id)
  }, [condition])

  return useMemo(callback, [now])
}
