import React, { useEffect, useMemo, useState } from 'react'
import styles from "./CustomTagMatchUi.lazy.module.css"
import Box from "./Box.jsx"
import { hhmmss, seconds } from "../duration-format.mjs"
import { useTimeUpdate } from "../use-time-update.mjs"

export default function CustomTagMatchUi({ players, meName, it, state, created, showRanking }) {
  useEffect(() => {
    styles.use()
  }, [])

  const isWaiting = useMemo(() => {
    return state === 'waiting'
  }, [state])

  const remainingTime = useTimeUpdate(() => {
    return (created + 30000) - Date.now()
  }, isWaiting)

  const now = useTimeUpdate(() => {
    return Date.now()
  }, players.length > 0)

  const showKillIt = useMemo(() => {
    return state === 'playing' && it !== null && it.name !== meName
  }, [state, it, meName])

  const showYouAreIt = useMemo(() => {
    return state === 'playing' && it !== null && it.name === meName
  }, [state, it, meName])

  const ranking = useMemo(() => {
    let results = players.map(player => {
      let time = player.time
      let me = false

      if (it !== null) {
        if (it.name === player.name) {
          time += now - it.started
        }
      }

      if (player.name === meName) {
        me = true
      }

      return {
        name: player.name,
        it: player.it,
        me,
        time
      }
    })

    results.sort((a, b) => b.time - a.time)

    return results
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

      {showKillIt && (
        <div className={[styles.locals.it, 'boomer-text-shadow'].join(' ')}>
          <div>Kill</div>
          <div className={styles.locals.itName}>{it.name}</div>
        </div>
      )}

      {showYouAreIt && (
        <div className={[styles.locals.it, 'boomer-text-shadow'].join(' ')}>
          <div>You're it</div>
          <div className={styles.locals.itName}>STAY ALIVE</div>
        </div>
      )}

      {showRanking && (
        <div className={styles.locals.players}>
          <Box>
            <div className={styles.locals.playersContent}>
              {ranking.map(player => {
                return (
                  <div className={[styles.locals.playersEntry, player.me ? styles.locals.playersEntryMe : ''].join(' ')} key={player.name}>
                    <span className={[styles.locals.playersEntryIt, player.it ? styles.locals.show : ''].join(' ')}>➤</span>
                    #{player.position} {player.name}: {hhmmss(player.time)}
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
