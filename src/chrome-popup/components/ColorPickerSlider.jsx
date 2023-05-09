import React from 'react';
import { Hue, Saturation } from 'react-color/lib/components/common'
import { CustomPicker } from 'react-color';

const MyCustomPicker = CustomPicker(class extends React.Component {
  render() {
    return (
      <div>
        <div style={{ position: 'relative', height: '1em' }}>
          <Hue
            {...this.props}
          />
        </div>
        <div style={{ position: 'relative', height: '5em' }}>
          <Saturation
            {...this.props}
          />
        </div>
      </div>
    )
  }
})

export default function ColorPickerSlider({ value, onChange }) {
  function handleChangeComplete(e) {
    if (onChange) {
      onChange(e.hex)
    }
  }

  return (
    <MyCustomPicker
      color={value}
      onChangeComplete={handleChangeComplete}
    />
  )
}
