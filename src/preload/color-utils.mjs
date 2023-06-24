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

export function getLightness(rgbColor) {
  // Remove the "#" symbol if present
  const color = rgbColor.replace("#", "");

  // Extract the red, green, and blue components from the RGB color string
  const red = parseInt(color.substr(0, 2), 16);
  const green = parseInt(color.substr(2, 2), 16);
  const blue = parseInt(color.substr(4, 2), 16);

  // Normalize the RGB values
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;

  // Find the minimum and maximum color components
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);

  // Calculate the lightness (L)
  const lightness = (max + min) / 2;

  return lightness;
}

// Helper function to clamp a value between a minimum and maximum
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Helper function to convert a component value to hexadecimal
function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function adjustBrightness(rgbColor, brightness) {
  // Remove the "#" symbol if present
  const color = rgbColor.replace("#", "");

  // Extract the red, green, and blue components from the RGB color string
  const red = parseInt(color.substr(0, 2), 16);
  const green = parseInt(color.substr(2, 2), 16);
  const blue = parseInt(color.substr(4, 2), 16);

  // Adjust the brightness relative to the original color
  const adjustedRed = clamp(Math.round(red + (brightness * (255 - red))), 0, 255);
  const adjustedGreen = clamp(Math.round(green + (brightness * (255 - green))), 0, 255);
  const adjustedBlue = clamp(Math.round(blue + (brightness * (255 - blue))), 0, 255);

  // Convert the adjusted RGB values back to hexadecimal
  const adjustedColor = `#${componentToHex(adjustedRed)}${componentToHex(adjustedGreen)}${componentToHex(adjustedBlue)}`;

  return adjustedColor;
}

export function cssColorComplementary(color) {
  color = toRgbHex(color)

  if (!color) {
    throw new Error('Unrecognized color.')
  }

  const rgb = parseInt(color.substring(1), 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >>  8) & 0xff
  const b = (rgb >>  0) & 0xff
  
  return '#' + (255 - r).toString(16).padStart(2, '0') + (255 - g).toString(16).padStart(2, '0') + (255 - b).toString(16).padStart(2, '0')
}
