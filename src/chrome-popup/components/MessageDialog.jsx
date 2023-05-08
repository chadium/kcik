import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Button from "./Button.jsx"
import ModalBox from "./ModalBox.jsx"

export default function MessageDialog({ show, title, message, buttons, onAccept, onReject }) {
  let realButtons = useMemo(() => {
    if (buttons === undefined) {
      buttons = [
        {
          text: 'OK',
          action: 'accept',
        }
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
        theme: button.theme
      })
    }

    return realButtons
  }, [buttons, onAccept, onReject])

  return (
    <ModalBox show={show} onClose={onReject} title={title}>
      <p>{message}</p>

      <div className="boomer-p-t"></div>

      <div>
        {realButtons.map((entry, i) => <Button {...entry} key={i}/>)}
      </div>
    </ModalBox>
  )
}
