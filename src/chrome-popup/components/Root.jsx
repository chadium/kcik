import React from 'react'
import "./Root.css"
import Connected from './Connected.jsx'
import Disconnected from './Disconnected.jsx'
import Loading from './Loading.jsx'

export default function Root({ com, repo, error, loading }) {
  if (loading) {
    return <Loading/>
  } else if (error) {
    return <Disconnected error={error}/>
  } else {
    return <Connected com={com} repo={repo}/>
  }
}
