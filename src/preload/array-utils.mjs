export function removeFirstByValue(a, v) {
  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] === v) {
      a.splice(i, 1)
      return
    }
  }
}
