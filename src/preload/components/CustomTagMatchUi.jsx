import React, { useEffect, useMemo, useState } from 'react'
import styles from "./CustomTagMatchUi.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss, seconds } from "../duration-format.mjs"
import { useTimeUpdate } from "../use-time-update.mjs"

export default function CustomTagMatchUi({ players, it, state, created }) {
  useEffect(() => {
    styles.use()
  }, [])

  const isWaiting = useMemo(() => {
    return state === 'waiting'
  }, [state])

  const showPlayers = useMemo(() => {
    return state === 'playing'
  }, [state])

  const remainingTime = useTimeUpdate(() => {
    return (created + 30000) - Date.now()
  }, isWaiting)

  const now = useTimeUpdate(() => {
    return Date.now()
  }, players.length > 0)

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
    <div>
      {isWaiting && (
        <>
          <div className={styles.locals.waiting}>
            <Box>
              <div className={styles.locals.waitingIntro}>Tag match will start in</div>
              <div className={styles.locals.waitingTimer}>{seconds(remainingTime)} secs</div>
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
    </div>
  )
}
