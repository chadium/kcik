import React, { useEffect, useMemo } from 'react'
import styles from "./MatchRanking.lazy.css"
import SquadScore from "./SquadScore.jsx"
import Box from "./Box.jsx"

export default function MatchRanking({ squads, show }) {
  useEffect(() => {
    styles.use()
  }, [])

  let type = useMemo(() => {
    let maxMembers = 0

    for (let squad of squads) {
      if (squad.members.length > maxMembers) {
        maxMembers = squad.members.length
      }
    }

    if (maxMembers === 0) {
      return 'Team'
    } else if (maxMembers === 1) {
      return 'Solo'
    } else if (maxMembers === 2) {
      return 'Duo'
    } else if (maxMembers === 3) {
      return 'Trio'
    } else if (maxMembers === 4) {
      return 'Squad'
    }
  }, [squads])

  if (!show) {
    return <></>
  }

  return (
    <div className="match-ranking">
      <Box>
        <div className="match-ranking__title">
          Boomer's {type} Match
        </div>

        <div className="match-ranking__squads">
          {squads.map(squad => (
            <SquadScore key={squad.name} name={squad.name} color={squad.color} members={squad.members}/>
          ))}
        </div>
      </Box>
    </div>
  )
}
