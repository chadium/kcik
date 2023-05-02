import React, { useEffect, useState, useMemo } from 'react'
import InputCheck from './InputCheck.jsx'
import Flow from './Flow.jsx'

export default function CheckMulti({ options, value, onChange }) {
  return (
    <Flow>
      {options.map(option => {
        let index = value.indexOf(option.value)
        let isSelected = index !== -1

        function checkChange() {
          let newValue = value ? value.concat() : []

          if (isSelected) {
            newValue.splice(index, 1)
          } else {
            newValue.push(option.value)
          }

          if (onChange) {
            onChange(newValue)
          }
        }

        return <InputCheck key={option.value} label={option.label} value={isSelected} onChange={checkChange}/>
      })}
    </Flow>
  )
}