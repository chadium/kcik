import React, { useEffect, useMemo, useState } from 'react'
import ComboBox from "./ComboBox.jsx"

const options = [
  {
    label: 'No',
    value: false,
  },
  {
    label: 'Yes',
    value: true
  },
]

export default function ComboBoxTruth({ value, onChange }) {
  return (
    <ComboBox options={options} value={value} onChange={onChange}/>
  )
}
