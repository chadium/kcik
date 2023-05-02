import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Train from "./Train.jsx"
import InputText from "./InputText.jsx"
import Button from "./Button.jsx"
import ModalBox from "./ModalBox.jsx"

export default function Prompt({ show, title, placeholder, buttons, onEnter, onCancel }) {
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
          theme: 'other',
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
        theme: button.theme
      })
    }

    return realButtons
  }, [buttons, onAccept, onReject])

  return (
    <ModalBox show={show} onClose={onReject} title={title}>
      <InputText placeholder={placeholder} value={input} onChange={setInput}/>

      <div className="boomer-p-t"></div>

      <Train>
        {realButtons.map((entry, i) => <Button {...entry} key={i}/>)}
      </Train>
    </ModalBox>
  )
}
