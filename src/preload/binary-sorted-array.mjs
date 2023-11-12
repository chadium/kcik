import BSA from 'binary-sorted-array'

export class BinarySortedArray extends BSA {
  constructor(arr, cmp) {
    super(arr, cmp)
  }

  get length() {
    return this.array.length
  }

  map() {
    return this.array.map.apply(this.array, arguments)
  }

  includes(needle) {
    return this.indexOf(needle) !== -1
  }

  push(item) {
    return this.insert(item)
  }

  get(index) {
    return this.array[index]
  }

  clone() {
    const copy = new BinarySortedArray()
    copy.array = this.array.concat()
    copy.compare = this.compare
    return copy
  }
}
