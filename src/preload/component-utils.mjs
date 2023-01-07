export function findCommonPlayerComponent(componentsManager) {
  let component = componentsManager.Components.find(c => {
    return c.schema.hasOwnProperty('player') && c.schema.hasOwnProperty('weapons')
  })

  return component ?? null
}
