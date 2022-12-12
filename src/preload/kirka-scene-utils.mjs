export function forAllObjects(obj, cb) {
  function inside(obj) {
    cb(obj)

    for (let child of obj.children) {
      inside(child)
    }
  }

  inside(obj)
}
