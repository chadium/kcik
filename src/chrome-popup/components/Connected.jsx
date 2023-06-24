import React, { useState, useMemo } from 'react'
import Page from './Page.jsx'
import TabWebsiteTheme from './tabs/TabWebsiteTheme.jsx'
import TabChatUsername from './tabs/TabChatUsername.jsx'
import TabChatFont from './tabs/TabChatFont.jsx'
import TabHost from './tabs/TabHost.jsx'
import TabKeyboardNavigation from './tabs/TabKeyboardNavigation.jsx'
import TabCredits from './tabs/TabCredits.jsx'
import ArrowNavigation from './ArrowNavigation.jsx'

const tabs = [
  {
    name: 'Website Theme',
    content: (params) => <TabWebsiteTheme {...params}/>
  },
  {
    name: 'Username',
    content: (params) => <TabChatUsername {...params}/>
  },
  {
    name: 'Chat Font',
    content: (params) => <TabChatFont {...params}/>
  },
  {
    name: 'Host',
    content: (params) => <TabHost {...params}/>
  },
  {
    name: 'Keyboard Navigation',
    content: (params) => <TabKeyboardNavigation {...params}/>
  },
  {
    name: 'Credits',
    content: (params) => <TabCredits {...params}/>
  }
]

export default function Connected({ com, repo }) {
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
      {activeTab.content({ com, repo })}
    </Page>
  )
}
