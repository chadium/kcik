import knownNames from './colors.mjs'
import { pSBC } from './colorfulmess.mjs'
import { increaseBrightness } from './colorfulmess2.mjs'

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

export function adjustBrightness(rgbColor, brightness) {
  return increaseBrightness(rgbColor, brightness);
}

export function rgbToHsl(r, g, b) {
  if (typeof r === 'string') {
    const rgb = r.replace("#", "");

    r = parseInt(rgb.substr(0, 2), 16);
    g = parseInt(rgb.substr(2, 2), 16);
    b = parseInt(rgb.substr(4, 2), 16);
  }

  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
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
