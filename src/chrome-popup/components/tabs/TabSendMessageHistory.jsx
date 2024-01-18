import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'
import { chatMessageDeletedMode } from '../../repository.mjs'

export default function TabSendMessageHistory({ com, repo }) {
  let fetchResource = useCallback(() => repo.getEnableSendMessageHistory(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      {data !== null && (
        <div>
          <div>
            <InputCheck
              label="Enable"
              value={data}
              onChange={async (value) => {
                await repo.setEnableSendMessageHistory(value)
                com.mail('kcik.enableSendMessageHistory', value)
                setData(value)
              }}
            />
          </div>

          <div className="chad-p-t"></div>

          <p>
            Lets you use up and down arrows to navigate through your
            chat message history. Keeps track of the last 100 messages.
            Messages are lost when you refresh or close the page.
          </p>
        </div>
      )}
    </GenericLoading>
  )
}
