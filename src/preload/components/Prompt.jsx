import React, { useState, useEffect, useMemo, useCallback } from 'react'
import styles from "./Prompt.lazy.css"
import Button from "./Button.jsx"
import Box from "./Box.jsx"

export default function Prompt({ show, title, placeholder, buttons, onEnter, onCancel }) {
  useEffect(() => {
    styles.use()
  }, [])

  let [input, setInput] = useState('')

  const onAccept = useCallback(function (e) {
    if (onEnter) {
      onEnter({
        input
      })
    }
  }, [onEnter, input])

  const onReject = useCallback(function (e) {
    if (onCancel) {
      onCancel()
    }
  }, [onCancel])

  let realButtons = useMemo(() => {
    if (buttons === undefined) {
      buttons = [
        {
          text: 'OK',
          action: 'accept', 
        },
        {
          text: 'Cancel',
          action: 'reject', 
        },
      ]
    }

    let map = {
      accept: onAccept,
      reject: onReject
    }

    let realButtons = []

    for (let button of buttons) {
      realButtons.push({
        children: button.text,
        onClick: map[button.action],
      })
    }

    return realButtons
  }, [buttons, onAccept, onReject])

  if (!show) {
    return <></>
  }

  return (
    <div className="prompt">
      <Box>
        <div className="prompt__padding">
          <div className="prompt__title">
            {title}
          </div>

          <div className="prompt__input">
            <input placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)}/>
          </div>

          <div className="prompt__actions">
            {realButtons.map((entry, i) => <Button {...entry} key={i}/>)}
          </div>
        </div>
      </Box>
    </div>
  )
}
