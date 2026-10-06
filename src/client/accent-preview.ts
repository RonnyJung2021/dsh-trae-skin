/**
 * What the configured accent becomes, per shell, as the card prints it.
 *
 * The card shows this because a colour the user types is a **fill**: whether it can
 * also carry text is a question only the shell's own page can answer, and the answer
 * is a measurement rather than a promise. It is the same derivation the applier
 * makes — `accentsFor` against the compiled shells — so the card can never print a
 * value the page would not paint.
 */

import { DARK_SHELL, LIGHT_SHELL } from '../constants/palette.ts'
import type { AccentPreview } from '../types/panel.ts'
import { accentsFor } from '../utils/accent.ts'
import { formatRatio, isColor } from '../utils/color.ts'

/**
 * Derive one accent's whole set for the card.
 * @param accent - the draft's accent literal.
 * @returns both shells' derivations, or undefined when the literal does not parse.
 */
export function accentPreview(accent: string): AccentPreview | undefined {
  if (!isColor(accent)) return undefined
  const light = accentsFor(accent, LIGHT_SHELL)
  const dark = accentsFor(accent, DARK_SHELL)
  return {
    fill: light.fill,
    hover: light.hover,
    wash: light.wash,
    textLight: { value: light.text, ratio: formatRatio(light.textRatio) },
    textDark: { value: dark.text, ratio: formatRatio(dark.textRatio) },
    gradientLight: light.gradient,
    gradientDark: dark.gradient,
  }
}
