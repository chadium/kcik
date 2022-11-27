import React, { useEffect, useMemo } from 'react'
import styles from "./SquadScoreApp.lazy.css"
import SquadScore from "./SquadScore.jsx"

export default function SquadScoreApp({ squads, show }) {
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
    <div className="squad-score-app">
      <div className="squad-score-app__title">
        Boomer's {type} Match
      </div>

      <div className="squad-score-app__squads">
        {squads.map(squad => (
          <SquadScore key={squad.name} name={squad.name} color={squad.color} members={squad.members}/>
        ))}
      </div>
    </div>
  )
}
