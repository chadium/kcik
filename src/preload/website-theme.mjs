import * as colorUtils from './color-utils.mjs'

function getTextColor(color) {
  return colorUtils.getLightness(color) >= 0.5 ? '#232323' : '#ffffff'
}

export function websiteThemeValues(websiteTheme) {
  // Equivalent to: #0b0e0f
  let mainColor = websiteTheme?.mainColor ?? '#0b0e0f'

  // Seen #0f1214.

  // Equivalent to: #191b1f, #171c1e
  let shade1 = colorUtils.adjustBrightness(mainColor, 0.06 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #202225
  let shade2 = colorUtils.adjustBrightness(mainColor, 0.08 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #24272c, #232628
  let shade3 = colorUtils.adjustBrightness(mainColor, 0.1 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #313538, #271B1D
  let shade4 = colorUtils.adjustBrightness(mainColor, 0.15 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #3f4448, #374151
  let shade5 = colorUtils.adjustBrightness(mainColor, 0.2 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #474f54
  let shade6 = colorUtils.adjustBrightness(mainColor, 0.25 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #6b7280
  let shade7 = colorUtils.adjustBrightness(mainColor, 0.35 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #929ea6
  let shade8 = colorUtils.adjustBrightness(mainColor, 0.5 * (colorUtils.getLightness(mainColor) >= 0.5 ? -1 : 1))

  let textColor = getTextColor(mainColor)

  // Equivalent to: #e5e7eb
  let textColorSubtle1 = colorUtils.adjustBrightness(textColor, 0.18 * (colorUtils.getLightness(textColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #b1bcc3
  let textColorSubtle2 = colorUtils.adjustBrightness(textColor, 0.5 * (colorUtils.getLightness(textColor) >= 0.5 ? -1 : 1))

  // Equivalent to: #53fc18
  // When I first released the extension with the website theme feature,
  // I had the complementary color set automatically by an algorithm.
  // I, Chad Thundercock, decided that it wouldn't do too much harm to break
  // backwards compatibility in the next release by using the default color.
  let complementary = websiteTheme?.complementaryColor ?? '#53fc18'

  // Equivalent to: #3ad305
  let complementaryShade1 = colorUtils.adjustBrightness(complementary, 0.1 * (colorUtils.getLightness(complementary) >= 0.5 ? -1 : 1))

  // Equivalent to: #21650a
  let complementaryShade2 = colorUtils.adjustBrightness(complementary, 0.2 * (colorUtils.getLightness(complementary) >= 0.5 ? -1 : 1))

  let complementaryText = getTextColor(complementary)

  return {
    mainColor,
    shade1,
    shade2,
    shade3,
    shade4,
    shade5,
    shade6,
    shade7,
    shade8,
    textColor,
    textColorSubtle1,
    textColorSubtle2,
    complementary,
    complementaryShade1,
    complementaryShade2,
    complementaryText,
  }
}