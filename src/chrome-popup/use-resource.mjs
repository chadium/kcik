import { useState, useEffect, useMemo } from 'react'
import { useIncrement } from './use-increment.mjs'

export function useResource(fetchResource) {
  const [id, refreshData] = useIncrement()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)

    if (fetchResource === undefined || fetchResource === null) {
      // Always in loading.
      return
    }

    async function doTheWork()  {
      try {
        let result = await fetchResource()

        setData(result)
        setError(null)
      } catch (e) {
        console.error(e)

        setData(null)
        try {
          if (e instanceof Error) {
            setError(e)
          } else {
            setError(new Error(e))
          }
        } catch (e) {
          console.error(e)

          setError(new Error('Mysterious error'))
        }
      } finally {
        setLoading(false)
      }
    }

    doTheWork()
  }, [id, fetchResource])

  return { data, setData, loading, error, refreshData }
}
