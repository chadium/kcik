export class CreateMatchOptions {
  constructor() {
    this._privacy = 'private'
    this._modes = ['solo']
    this._players = 8
    this._minutes = 8
    this._damage = true
    this._speed = 1
    this._gravity = 1
    this._jump = 1
    this._maps = []
    this._weapons = []
    this._name = ''
  }

  setPrivacy(privacy) {
    this._privacy = privacy
  }

  setMode(mode) {
    this._modes = [mode]
  }

  setPlayers(players) {
    this._players = players
  }

  setMinutes(minutes) {
    this._minutes = minutes
  }

  setMap(map) {
    this._maps = [map]
  }

  setWeapons(weapons) {
    this._weapons = weapons.concat()
  }

  setName(name) {
    this._name = name
  }

  applyToKirkaGame(o) {
    o.create = true

    for (let key in o.weapons) {
      o.weapons[key].active = this._weapons.includes(o.weapons[key].type)
    }

    for (let key in o.maps) {
      o.maps[key].active = this._maps.includes(o.maps[key].type)
    }

    for (let key in o.mods) {
      o.mods[key].active = this._modes.includes(o.mods[key].type)
    }

    o.metadata.gravity = this._gravity
    o.metadata.speed = this._speed
    o.metadata.mwNnMW = this._jump

    o.maxPlayers = this._players
    o.minutes = this._minutes

    o.privacy = this._privacy

    o.serverName = this._name

    o.searchingRoom = false
  }
}
