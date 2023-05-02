import { useState, useMemo } from 'react'

export function useIncrement(start = 0) {
  const [id, setId] = useState(start)
  const increment = useMemo(() => {
    let intermediate = id
    return () => {
      setId(intermediate = intermediate + 1)
    }
  }, [])

  return [id, increment]
}
