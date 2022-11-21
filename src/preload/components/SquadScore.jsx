import React, { useEffect, useMemo } from 'react'
import styles from "./SquadScore.lazy.css"

export default function SquadScore({ name, color, members }) {
  useEffect(() => {
    styles.use()
  }, [])

  let totalScore = useMemo(() => {
    let total = 0

    for (let member of members) {
      total += member.score
    }

    return total
  }, [members])

  return (
    <div className="squad-score">
      <div className="squad-score__title" style={{ backgroundColor: color }}>
        <div className="squad-score__title__score">{totalScore}</div>
        {name.toUpperCase()}
      </div>
      <div className="squad-score__members">
        {members.map(member => (
          <div key={member.name} className="squad-score__members__item">
            <div className="squad-score__members__item__name">{member.name}</div>
            <div>{member.kills} 🎯</div>
            <div>{member.deaths} 💀</div>
            <div className="squad-score__members__item__score">{member.score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
