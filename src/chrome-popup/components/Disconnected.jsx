import React, { useEffect } from 'react'
import Page from './Page.jsx'
import styles from "./Disconnected.lazy.module.css"
import TextLink from './TextLink.jsx'

export default function Disconnected() {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <Page theme="bad">
      <div className={styles.locals.container}>
          <div className="boomer-p-t"/>
          <div className="boomer-p-t"/>
        <div className={styles.locals.bigBoldAndBeautiful}>Disconnected</div>

        <div className={styles.locals.details}>
          <div className="">Couldn't connect to kick.com</div>
          <div className="boomer-p-t"/>
          <div className=""><b>Are you on the website?</b></div>
          <div className="boomer-p-t"/>
          <div className=""><TextLink newTab url="https://kick.com">Click here to go to kick.com</TextLink></div>
        </div>
      </div>
    </Page>
  )
}
