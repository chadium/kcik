import React from 'react'

export default function Page({ theme, children, footer }) {
  const themeClass = theme ? `bg-${theme}` : undefined

  return (
    <div className={['page', themeClass].join(' ')}>
      <div className="page__content">
        {children}
      </div>

      <div className="page__footer">{footer}</div>
    </div>
  )
}
