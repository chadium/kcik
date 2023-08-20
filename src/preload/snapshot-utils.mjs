export function findNodesWithElement(snapshot, element) {
  let candidates = [snapshot]
  let results = []

  while (candidates.length > 0) {
    let candidate = candidates.pop()

    if (
        candidate.vm.el !== null
        && candidate.vm.el.contains
        && candidate.vm.el.contains(element)
    ) {
      results.push(candidate)
    }

    candidates = candidates.concat(candidate.children)
  }

  return results
}
