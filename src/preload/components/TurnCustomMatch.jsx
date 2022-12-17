import React, { useEffect, useMemo, useState } from 'react'
import ModalBox from "./ModalBox.jsx"
import ComboBox from "./ComboBox.jsx"
import InputText from "./InputText.jsx"
import InputNumber from "./InputNumber.jsx"
import InputCheck from './InputCheck.jsx'
import Button from "./Button.jsx"
import CheckMulti from './CheckMulti.jsx'
import FormCategory from './FormCategory.jsx'
import FormField from './FormField.jsx'
import Flow from './Flow.jsx'

const typeOptions = [
  {
    label: 'Tag',
    value: 'tag',
  },
  {
    label: 'Multi Team Deathmatch',
    value: 'multi-team-deathmatch',
  },
  {
    label: 'Hide and seek',
    value: 'hide-n-seek',
  },
]

export default function TurnCustomMatch({ show, onCreate, onCancel }) {
  const [data, setData] = useState({
    type: typeOptions[0].value
  })

  function create() {
    onCreate({
      type: data.type
    })
  }

  function onClose() {
    onCancel()
  }

  return (
    <ModalBox variant="thick" show={show} onClose={onClose} title={"Create Custom Match"}>
      <FormCategory label="Type">
        <ComboBox options={typeOptions} value={data.type} onChange={(type) => setData({ ...data, type })}/>
      </FormCategory>

      <div className="boomer-p-t"></div>
      <div className="boomer-p-t"></div>

      <Flow>
        <Button onClick={create}>Create</Button>
        <Button theme="other" onClick={onClose}>Cancel</Button>
      </Flow>
    </ModalBox>
  )
}
