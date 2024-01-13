import React from 'react'
import "./Root.css"
import Connected from './Connected.jsx'
import Disconnected from './Disconnected.jsx'

export default function Root({ com, repo, error }) {
  if (error) {
    return <Disconnected error={error}/>
  } else {
    return <Connected com={com} repo={repo}/>
  }
}
