import React, { useEffect } from 'react'
import styles from "./SquadScoreApp.lazy.css"
import SquadScore from "./SquadScore.jsx"

export default function SquadScoreApp() {
  useEffect(() => {
    styles.use()
  }, [])

  let squads = [
    {
      name: 'red',
      color: '#e70000',
      members: [
        {
          name: 'boomer',
          kills: 1,
          deaths: 2,
          score: 100
        },
        {
          name: 'helper',
          kills: 0,
          deaths: 0,
          score: 0
        },
      ]
    },
    {
      name: 'blue',
      color: '#0000b3',
      members: [
        {
          name: 'someone1',
          kills: 0,
          deaths: 0,
          score: 0
        },
        {
          name: 'someone2',
          kills: 0,
          deaths: 0,
          score: 0
        },
      ]
    },
    {
      name: 'yellow',
      color: '#a9a900',
      members: [
        {
          name: 'someone3',
          kills: 0,
          deaths: 0,
          score: 0
        },
        {
          name: 'someone4',
          kills: 0,
          deaths: 0,
          score: 0
        },
      ]
    }
    ,
    {
      name: 'green',
      color: '#057e05',
      members: [
        {
          name: 'someone5',
          kills: 0,
          deaths: 0,
          score: 0
        },
        {
          name: 'someone6',
          kills: 0,
          deaths: 0,
          score: 0
        },
      ]
    }
  ]

  return (
    <div className="squad-score-app">
      <div className="squad-score-app__title">
        Boomer's Squad Match
      </div>

      <div className="squad-score-app__squads">
        {squads.map(squad => (
          <SquadScore key={squad.name} name={squad.name} color={squad.color} members={squad.members}/>
        ))}
      </div>
    </div>
  )
}
