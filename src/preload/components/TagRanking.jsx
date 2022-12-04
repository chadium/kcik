import React, { useEffect, useMemo, useState } from 'react'
import styles from "./TagRanking.lazy.css"
import Box from "./Box.jsx"
import { hhmmss } from "../duration-format.mjs"

export default function TagRanking({ players, it, show }) {
  useEffect(() => {
    styles.use()
  }, [])

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let id = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const finalPlayers = useMemo(() => {
    let results = players.map(player => {
      let time = player.time

      if (it !== null) {
        if (it.name === player.name) {
          time += now - it.started
        }
      }

      return {
        name: player.name,
        it: player.it,
        time
      }
    })

    results.sort((a, b) => b.time - a.time)

    results.forEach((player, i) => {
      player.position = i + 1
    })

    return results
  }, [players, it, now])

  if (!show) {
    return <></>
  }

  return (
    <div className="tag-ranking">
      <Box>
        <div className="tag-ranking__title">
          Boomer's Tag Match
        </div>

        <div className="tag-ranking__players">
          {finalPlayers.map(player => {
            return (
              <div key={player.name}>#{player.position} {player.name}: {hhmmss(player.time)} {player.it ? "(it)" : ""}</div>
            )
          })}
        </div>
      </Box>
    </div>
  )
}
