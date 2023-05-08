import React from 'react'
import "./Root.css"
import Connected from './Connected.jsx'
import Disconnected from './Disconnected.jsx'

export default function Root({ com, error }) {
  if (error) {
    return <Disconnected/>
  } else {
    return <Connected com={com}/>
  }
}
