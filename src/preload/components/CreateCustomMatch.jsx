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
import { CreateMatchOptions } from '../CreateMatchOptions.mjs'
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
  {
    label: 'Hide and seek',
    value: 'hide-n-seek',
  },
]

export default function CreateCustomMatch({ show, maps = [], weapons = [], onCreate, onCancel }) {
  const [data, setData] = useState({
    type: typeOptions[0].value,
    players: 8,
    minutes: 8,
    map: maps?.[0]?.value,
    weapons: weapons.map(w => w.value),
    name: ''
    //name: 'Yeehaw'
  })

  function create() {
    let kirkaOptions = new CreateMatchOptions()

    if (data.type === 'tag') {
      kirkaOptions.setPrivacy('private')
      kirkaOptions.setMode('DeathmatchRoom')
      kirkaOptions.setPlayers(data.players)
      kirkaOptions.setMinutes(data.minutes)
      kirkaOptions.setMap(data.map)
      kirkaOptions.setWeapons(data.weapons)
      kirkaOptions.setName(data.name)
    } else if (data.type === 'multi-team-deathmatch') {
      kirkaOptions.setPrivacy('private')
      kirkaOptions.setMode('DeathmatchRoom')
      kirkaOptions.setPlayers(data.players)
      kirkaOptions.setMinutes(data.minutes)
      kirkaOptions.setMap(data.map)
      kirkaOptions.setWeapons(data.weapons)
      kirkaOptions.setName(data.name)
    } else {
      throw new Error(`Unknown type ${data.type}`)
    }

    onCreate({
      type: data.type,
      kirkaOptions
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
          control={<InputNumber value={data.players} onChange={(players) => setData({ ...data, players })}/>}
        />
        <FormField
          label="Minutes"
          control={<InputNumber value={data.minutes} onChange={(minutes) => setData({ ...data, minutes })}/>}
        />
      </FormCategory>

      <FormCategory label="Map">
        <ComboBox options={maps} value={data.map} onChange={(map) => setData({ ...data, map })}/>
      </FormCategory>

      <FormCategory label="Weapons">
        <CheckMulti options={weapons} value={data.weapons} onChange={(weapons) => setData({ ...data, weapons })}/>
      </FormCategory>

      <FormCategory label="Server Name">
        <InputText placeholder={data.type} value={data.name} onChange={(name) => setData({ ...data, name })}/>
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
