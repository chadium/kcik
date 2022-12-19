import React, { useEffect, useMemo, useState } from 'react'
import styles from "./CustomTagMatchUi.lazy.module.css"
import Box from "./Box.jsx"
import BouncingText from "./BouncingText.jsx"
import PosLabel from "./PosLabel.jsx"
import { mmss, seconds } from "../duration-format.mjs"
import { useTimeUpdate } from "../use-time-update.mjs"

export default function CustomTagMatchUi({
  now,
  players,
  meName,
  it,
  state,
  created,
  showRanking,
  serverTime,
  duration,
}) {
  useEffect(() => {
    styles.use()
  }, [])

  const isWaiting = useMemo(() => {
    return state === 'waiting'
  }, [state])

  const isPlaying = useMemo(() => {
    return state === 'playing'
  }, [state])

  const isEnd = useMemo(() => {
    return state === 'endScreen'
  }, [state])

  const remainingWaitingTime = useTimeUpdate(() => {
    return (created + 30000) - now()
  }, isWaiting)

  const remainingPlayingTime = useTimeUpdate(() => {
    return duration - serverTime.getTweened()
  }, isPlaying)

  const itSurvivingTime = useTimeUpdate(() => {
    return now() - it.started
  }, it !== null, [it])

  const updateTime = useTimeUpdate(() => {
    return now()
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
          time += updateTime - it.started
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

    results.forEach((e, i) => e.position = i + 1)

    return results
  }, [players, it, meName, updateTime])

  return (
    <div>
      {isWaiting && (
        <>
          <div className={[styles.locals.waiting, 'boomer-text-shadow'].join(' ')}>
            <div className={styles.locals.waitingIntro}>Tag match will start in</div>
            <div className={styles.locals.waitingTimer}>{seconds(remainingWaitingTime)} secs</div>
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

      <div className={styles.locals.leftSide}>
        {isPlaying && (
          <div className={styles.locals.time}>
            <Box>
              <div className={styles.locals.timeContent}>
                <div>{mmss(remainingPlayingTime)}</div>
              </div>
            </Box>
          </div>
        )}

        {showRanking && !isWaiting && (
          <div className={styles.locals.players}>
            <Box>
              <div className={styles.locals.playersContent}>
                {ranking.map(player => {
                  return (
                    <div className={[styles.locals.playersEntry, player.me ? styles.locals.playersEntryMe : ''].join(' ')} key={player.name}>
                      <span className={[styles.locals.playersEntryIt, player.it ? styles.locals.show : ''].join(' ')}>➤</span>
                      <span className={styles.locals.playersEntryPosition}><PosLabel position={player.position}/></span>{player.name}: {mmss(player.time)}
                    </div>
                  )
                })}
              </div>
            </Box>
          </div>
        )}
      </div>

      {showKillIt && (
        <div className={[styles.locals.it, 'boomer-text-shadow'].join(' ')}>
          <div>Kill</div>
          <div key={it.name} className={styles.locals.itName}>{it.name}</div>
        </div>
      )}

      {showYouAreIt && (
        <div className={[styles.locals.it, 'boomer-text-shadow'].join(' ')}>
          <div>You're it</div>
          <div className={styles.locals.itFlashy}><BouncingText text={"STAY ALIVE"}/></div>
        </div>
      )}

      {isEnd && (
        <div className={styles.locals.endScreen}>
          <div className={styles.locals.endScreenTitle}>Thank you for playing!</div>

          <div className={styles.locals.endScreenPlayers}>
            {ranking.map(player => {
              return (
                <div className={[styles.locals.endScreenPlayersItem, player.me ? styles.locals.endScreenPlayersItemMe : ''].join(' ')} key={player.name}>
                  <PosLabel position={player.position}/> {player.name}: {mmss(player.time)}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
