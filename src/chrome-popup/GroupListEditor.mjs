import EventEmitter from "events"

export class GroupListEditor {
  constructor({ groups }) {
    this.groups = groups
    this.list = {}

    for (let group of this.groups) {
      this.list[group] = new Set()
    }

    this.events = new EventEmitter()
  }

  set(list) {
    for (let group of this.groups) {
      if (list[group] === undefined) {
        this.list[group].clear()

        continue
      }

      this.list[group] = new Set(list[group])
    }
  }

  get() {
    const list = {}

    for (let group of this.groups) {
      list[group] = [...this.list[group]]
    }

    return list
  }

  on(type, cb) {
    this.events.on(type, cb)
  }

  off(type, cb) {
    this.events.off(type, cb)
  }

  add(username) {
    for (let group of this.groups) {
      this.list[group].add(username)
    }
  }

  remove(username) {
    for (let group of this.groups) {
      this.list[group].delete(username)
    }
  }

  allow(username, group) {
    this.list[group].add(username)
  }

  disallow(username, group) {
    this.list[group].delete(username)
  }

  usernames() {
    const usernames = new Set()
    for (let group of this.groups) {
      for (let username of this.list[group]) {
        usernames.add(username)
      }
    }
    return [...usernames]
  }

  getByUsername() {
    const list = {}

    for (let group of this.groups) {
      for (let username of this.list[group]) {
        if (list[username] === undefined) {
          list[username] = {}
        }

        list[username][group] = true
      }
    }

    for (let group of this.groups) {
      for (let value of Object.values(list)) {
        if (value[group] === undefined) {
          value[group] = false
        }
      }
    }

    return list
  }

  info() {
    const list = {}

    for (let group of this.groups) {
      for (let username of this.list[group]) {
        if (list[username] === undefined) {
          list[username] = {
            username,
            groups: [],
          }
        }

        list[username].groups.push(group)
      }
    }

    return Object.values(list)
  }
}
