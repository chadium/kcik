import React, { useEffect, useMemo, useState } from 'react'
import styles from "./CustomTagMatchUi.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss } from "../duration-format.mjs"

export default function CustomTagMatchUi({ players, it, state }) {
  useEffect(() => {
    styles.use()
  }, [])

  const [now, setNow] = useState(Date.now())

  const isWaiting = useMemo(() => {
    return state === 'waiting'
  }, [state])

  const showPlayers = useMemo(() => {
    return state === 'playing'
  }, [state])

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

    return results.slice(0, 3)
  }, [players, it, now])

  return (
    <>
      {isWaiting && (
        <>
          <div className={styles.locals.waiting}>
            <Box>
              <div className={styles.locals.waitingIntro}>Tag match will start in</div>
              <div className={styles.locals.waitingTimer}>30 secs</div>
            </Box>
          </div>

          <div className={styles.locals.rules}>
            <Box>
              <div>- Kill the person who's it.</div>
              <div>- Whoever kills it becomes it.</div>
              <div>- Stay it for as long as possible.</div>
            </Box>
          </div>
        </>
      )}

      {showPlayers && (
        <div className={styles.locals.players}>
          <Box>
            {finalPlayers.map(player => {
              return (
                <div key={player.name}>#{player.position} {player.name}: {hhmmss(player.time)} {player.it ? "(it)" : ""}</div>
              )
            })}
          </Box>
        </div>
      )}
    </>
  )
}
