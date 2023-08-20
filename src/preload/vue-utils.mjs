export function deepFindRefByName(vnode, name) {
  let candidates = [vnode]

  while (candidates.length > 0) {
    let candidate = candidates.pop()

    if (candidate.props) {
      if (candidate.props.ref_key === name) {
        return candidate.props.ref
      }
    }

    if (candidate.children) {
      candidates = candidates.concat(candidate.children)
    }
  }
}
