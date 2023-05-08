import React, { useState, useMemo } from 'react'
import Page from './Page.jsx'
import TabChatFont from './tabs/TabChatFont.jsx'
import TabCredits from './tabs/TabCredits.jsx'
import ArrowNavigation from './ArrowNavigation.jsx'

const tabs = [
  {
    name: 'Chat Font',
    content: (params) => <TabChatFont {...params}/>
  },
  {
    name: 'Credits',
    content: (params) => <TabCredits {...params}/>
  }
]

export default function Connected({ com }) {
  let [tabIndex, setTabIndex] = useState(0)
  let activeTab = useMemo(() => {
    return tabs[tabIndex]
  }, [tabIndex])

  return (
    <Page
      header={
        <ArrowNavigation
          tabIndex={tabIndex}
          tabs={tabs}
          onTabIndexChange={(tabIndex) => setTabIndex(tabIndex)}
        />
      }
    >
      {activeTab.content({ com })}
    </Page>
  )
}
