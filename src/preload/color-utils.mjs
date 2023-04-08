import knownNames from './colors.mjs'

/**
 * Tries to return a hex color for the given color id.
 *
 * @param {String} color
 * @returns {String}
 */
export function toRgbHex(color) {
  if (/^\#[A-Fa-f0-9]{6}$/.test(color)) {
    // Perfect. No need to do anything.
    return color
  }

  if (/^\#[A-Fa-f0-9]{3}$/.test(color)) {
    // Just gotta add the missing part.
    return color.concat(color.substring(1))
  }

  // Remove duplicate spaces.
  color = color.replace(/\s+/g, ' ')

  // Deal only with lower case. Makes it easy.
  color = color.toLowerCase()

  // Name look up.
  let name = knownNames[color]

  if (name === undefined) {
    // TODO: Use some library, maybe.
    return null
  }

  return name
}