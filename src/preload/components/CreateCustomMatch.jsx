import React, { useEffect, useMemo, useState } from 'react'
import ModalBox from "./ModalBox.jsx"
import ComboBox from "./ComboBox.jsx"
import InputText from "./InputText.jsx"
import InputNumber from "./InputNumber.jsx"
import Button from "./Button.jsx"
import CheckMulti from './CheckMulti.jsx'
import FormCategory from './FormCategory.jsx'
import FormField from './FormField.jsx'
import Flow from './Flow.jsx'
import { hhmmss } from "../duration-format.mjs"

const typeOptions = [
  {
    label: 'Tag',
    value: 'tag',
  },
  {
    label: 'Multi Team Deathmatch',
    value: 'multi-team-deathmatch',
  },
]

const mapOptions = [
  {
    label: 'Shipment',
    value: 'shipment',
  },
  {
    label: 'Town',
    value: 'town',
  }
]

const weaponOptions = [
  {
    label: 'Revolver',
    value: 'revolver',
  },
  {
    label: 'Tomahawk',
    value: 'tomahawk',
  }
]

export default function CreateCustomMatch({ show, onCreate, onCancel }) {
  const [data, setData] = useState({
    type: typeOptions[0].value,
    players: 8,
    minutes: 8,
    map: mapOptions[0].value,
    weapons: weaponOptions.map(w => w.value),
  })

  function create() {
    onCreate({
      type: data.type,
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

      <FormCategory label="Settings">
        <FormField
          label="Players"
          value={<InputNumber value={data.players} onChange={(players) => setData({ ...data, players })}/>}
        />
        <FormField
          label="Minutes"
          value={<InputNumber value={data.minutes} onChange={(minutes) => setData({ ...data, minutes })}/>}
        />
      </FormCategory>

      <FormCategory label="Map">
        <ComboBox options={mapOptions} value={data.map} onChange={(map) => setData({ ...data, map })}/>
      </FormCategory>

      <FormCategory label="Weapons">
        <CheckMulti options={weaponOptions} value={data.weapons} onChange={(weapons) => setData({ ...data, weapons })}/>
      </FormCategory>

      <FormCategory label="Server Name">
        <InputText placeholder={data.type} value={data.serverName} onChange={(serverName) => setData({ ...data, serverName })}/>
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
