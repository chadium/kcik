import React, { useState } from 'react'
import InputText from './InputText.jsx'
 
export default function InputNumber({ value, onChange }) {
  const [edit, setEdit] = useState(value !== undefined ? String(value) : '')
  const [previousEdit, setPreviousEdit] = useState(edit)

  function implOnChange(value) {
    setEdit(value)

    if (onChange === undefined) {
      return
    }

    let numValue = Number(value)

    if (!isNaN(numValue)) {
      setPreviousEdit(String(numValue))
      onChange(numValue)
    }
  }

  function implOnBlur() {
    // Correct display value.
    setEdit(previousEdit)
  }

  return (
    <InputText value={value} onChange={implOnChange} onBlur={implOnBlur}/>
  );
}
