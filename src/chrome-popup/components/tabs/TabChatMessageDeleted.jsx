import React, { useState, useEffect, useCallback } from 'react'
import GenericLoading from '../GenericLoading.jsx'
import InputCheck from '../InputCheck.jsx'
import { useResource } from '../../use-resource.mjs'
import { chatMessageDeletedMode } from '../../repository.mjs'

export default function TabChatMessageDeleted({ com, repo }) {
  let fetchResource = useCallback(() => repo.getChatMessageDeletedMode(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  return (
    <GenericLoading loading={loading} error={error}>
      {data !== null && (
        <div>
          <div className="chad-p-t"></div>

          <div>
            <InputCheck
              label="Show deleted messages"
              value={data === chatMessageDeletedMode.SHOW_MESSAGE}
              onChange={async (value) => {
                let mode = value ? chatMessageDeletedMode.SHOW_MESSAGE : chatMessageDeletedMode.DEFAULT
                await repo.setChatMessageDeletedMode(mode)
                com.send('kcik.chatMessageDeletedMode', mode)
                setData(mode)
              }}
            />
          </div>
        </div>
      )}
    </GenericLoading>
  )
}
