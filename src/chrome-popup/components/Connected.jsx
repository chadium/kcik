import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Page from './Page.jsx'
import TabHome from './tabs/TabHome.jsx'
import TabWebsiteTheme from './tabs/TabWebsiteTheme.jsx'
import TabChatUsername from './tabs/TabChatUsername.jsx'
import TabChatFont from './tabs/TabChatFont.jsx'
import TabHost from './tabs/TabHost.jsx'
import TabKeyboardNavigation from './tabs/TabKeyboardNavigation.jsx'
import TabCredits from './tabs/TabCredits.jsx'
import ArrowNavigation from './ArrowNavigation.jsx'
import { websiteThemeValues } from '../../preload/website-theme.mjs'
import { useResource } from '../use-resource.mjs'

const tabs = [
  {
    name: 'KCIK ' + BOOMER_VERSION,
    content: (params) => <TabHome {...params}/>
  },
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
  let fetchResource = useCallback(() => repo.getWebsiteTheme(), [repo])
  let { data, setData, loading, error } = useResource(fetchResource)

  let {
    mainColor,
    textColor,
    complementary,
    complementaryText
  } = useMemo(() => {
    return websiteThemeValues(data)
  }, [data])

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
      <style>
:root &#123;
  --chad-text-color: {textColor};
  --chad-bg-color: {mainColor};
  --chad-action-ok-text-color: {complementaryText};
  --chad-action-ok-bg-color: {complementary};
&#125;
      </style>

      {activeTab.content({ com, repo })}
    </Page>
  )
}
