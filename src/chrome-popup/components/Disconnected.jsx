import React, { useEffect } from 'react'
import Page from './Page.jsx'
import styles from "./Disconnected.lazy.module.css"
import TextLink from './TextLink.jsx'

export default function Disconnected() {
  useEffect(() => {
    styles.use()
  }, [])

  return (
    <Page theme="neutral">
      <div className={styles.locals.container}>
        <div  className={styles.locals.body}>
          <div className={styles.locals.bigBoldAndBeautiful}>{'KCIK ' + BOOMER_VERSION}</div>

          <div className="chad-subtle chad-text-small">
            An open source extension for the
            streaming platform kick.com
          </div>

          <div className="text-bad">Failed to connect to kick.com</div>

          <div className="chad-p-t"/>

          <div>
            This can happen when you're not in a kick.com
            tab or if the extension was recently updated.
          </div>

          <div className="chad-p-t"/>
        </div>

        <div className={styles.locals.bottom}>
          <div><TextLink newTab url="https://kick.com">Click here to open kick.com</TextLink></div>
        </div>
      </div>
    </Page>
  )
}
