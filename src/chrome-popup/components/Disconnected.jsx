import React, { useEffect } from 'react'
import Page from './Page.jsx'
import styles from "./Disconnected.lazy.module.css"
import TextLink from './TextLink.jsx'

export default function Disconnected({ error }) {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <Page theme="neutral">
      <div className={styles.locals.container}>
        <div  className={styles.locals.body}>
          <div className={styles.locals.bigBoldAndBeautiful}>{'KCIK ' + BOOMER_VERSION}</div>

          <div className="chad-p-t"/>

          <div className="chad-subtle chad-text-small">
            An open source extension for the
            streaming platform kick.com
          </div>

          <div className="chad-p-t"/>

          <div className="text-bad">{error.message}</div>

          <div className="chad-p-t"/>

          <div>
            If you're on a kick.com tab, try refreshing the page.
          </div>

          <div className="chad-p-t"/>
        </div>

        <div className={styles.locals.bottom}>
        </div>
      </div>
    </Page>
  )
}
