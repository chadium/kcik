import React, { useEffect, useMemo, useState } from 'react'
import styles from "./CustomTagMatchUi.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss, seconds } from "../duration-format.mjs"
import { useTimeUpdate } from "../use-time-update.mjs"

export default function CustomTagMatchUi({ players, meName, it, state, created }) {
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

    let playerEntry = null

    results.forEach((player, i) => {
      player.position = i + 1

      if (player.name === meName) {
        playerEntry = player
      }
    })

    let sliced = results.slice(0, 4)

    if (playerEntry !== null) {
      if (!sliced.find(r => r.name === playerEntry.name)) {
        sliced.push(playerEntry)

        if (sliced.length === 5) {
          sliced.splice(3, 1)
        }
      }
    }

    return sliced
  }, [players, it, meName, now])

  return (
    <div>
      {isWaiting && (
        <>
          <div className={[styles.locals.waiting, 'boomer-text-shadow'].join(' ')}>
            <div className={styles.locals.waitingIntro}>Tag match will start in</div>
            <div className={styles.locals.waitingTimer}>{seconds(remainingTime)} secs</div>
            <div className={styles.locals.waitingTip}>A random player will become it when the match starts</div>
          </div>

          <div className={styles.locals.rules}>
            <Box>
              <div className={styles.locals.rulesContent}>
                <div className={styles.locals.rulesTitle}>How to play:</div>
                <div>- Kill the person who's it.</div>
                <div>- Whoever kills it becomes it.</div>
                <div>- Stay it for as long as possible.</div>
              </div>
            </Box>
          </div>
        </>
      )}

      {showPlayers && (
        <div className={styles.locals.players}>
          <Box>
            <div className={styles.locals.playersContent}>
              {finalPlayers.map(player => {
                return (
                  <div className={[styles.locals.playersEntry, player.name === meName ? styles.locals.playersEntryMe : ''].join(' ')} key={player.name}>
                    #{player.position} {player.name}: {hhmmss(player.time)} {player.it ? "(it)" : ""}
                  </div>
                )
              })}
            </div>
          </Box>
        </div>
      )}
    </div>
  )
}
