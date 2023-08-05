import React, { useEffect } from 'react';
import { HexColorPicker } from "react-colorful";
import { useChangeRetarder } from '../use-change-retarder.mjs';
import styles from './ColorPickerSlider.lazy.css'

export default function ColorPickerSlider({ value, onChange }) {
  useEffect(() => {
    styles.use()
  }, [])

  if (value === null) {
    value = '#000000'
  }

  let { currentValue, onCurrentChange } = useChangeRetarder(value, onChange)

  return (
    <div className="color-picker-slider">
      <HexColorPicker
        color={value}
        onChange={onCurrentChange}
      />
    </div>
  )
}
