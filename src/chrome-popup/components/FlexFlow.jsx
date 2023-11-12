import React from 'react'

export default function FlexFlow({
  children,
  alignItems = 'center',
  multiplier = 1,
}) {
  const style = {
    display: 'flex',
    alignItems,
    gap: `calc(var(--chad-safe-space) * ${multiplier})`
  }

  return (
    <div style={style}>{children}</div>
  )
}
