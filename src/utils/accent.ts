/**
 * One input, one whole set of safe values.
 *
 * The user names an accent as a **fill**, `#rrggbb`, and this module answers every
 * other question the stylesheet can ask about it:
 *
 * - the fill, quantized to the literal that will actually be painted;
 * - a hover step, derived rather than read off the shell, because a hover taken
 *   from the shell would keep the reference's own green while the button it
 *   belongs to had already changed colour;
 * - a 12% wash, the reference's own informational tint;
 * - the value to use where the accent is rendered as **text**, moved until it
 *   clears 4.5:1 against the page it will be read on;
 * - the two ramps — the wordmark's own four stops, and the same four at 16% for
 *   the plate behind it.
 *
 * The ramps are the reference's own values whenever the accent is the reference's
 * own, per shell: the dark ramp's mint end is invisible on a white page, so the
 * light shell has its own four stops. Any other accent derives a ramp at the same
 * rhythm, measured off those two.
 */

import {
  GRADIENT_POSITIONS,
  GRADIENT_RHYTHM,
  HOVER_DARKEN,
  DISABLED_ALPHA,
  PLATE_ALPHA,
  WASH_ALPHA,
  type TraeShell,
} from '../constants/palette.ts'
import { DEFAULT_ACCENT } from '../constants/plugin.ts'
import type { AccentSet } from '../types/palette.ts'
import { contrast, darken, isColor, parseColor, readableOn, shift, toHex, withAlpha } from './color.ts'

/** The reference's own accent, re-exported so callers need one import for it. */
export { DEFAULT_ACCENT }

/**
 * Whether an accent is the reference's own.
 * @param accent - candidate literal.
 * @returns true when it parses to the same colour as the default.
 */
export function isDefaultAccent(accent: string): boolean {
  const parsed = parseColor(accent)
  const reference = parseColor(DEFAULT_ACCENT)
  return parsed !== undefined && reference !== undefined && toHex(parsed) === toHex(reference)
}

/**
 * Derive one shell's four brand stops.
 * @param accent - the configured fill.
 * @param shell - the shell the ramp is painted in.
 * @returns four literals, in the reference's own stop order.
 */
export function accentGradient(accent: string, shell: TraeShell): readonly string[] {
  if (isDefaultAccent(accent)) return shell.gradientStops
  const color = parseColor(accent)
  // Unreachable through either entry point — `resolveSettings` and the card both
  // reject an unparseable literal — but a fallback keeps one bad value from
  // erasing the ramp rather than merely spoiling it.
  if (color === undefined) return shell.gradientStops
  return GRADIENT_RHYTHM[shell.id].map(offset => toHex(shift(color, offset)))
}

/**
 * Derive every value the stylesheet spends the accent as.
 * @param accent - the configured fill, a `#rrggbb` literal.
 * @param shell - the shell the values will be painted in.
 * @returns the six derived values, plus the measured contrast of the text one.
 */
export function accentsFor(accent: string, shell: TraeShell): AccentSet {
  const fill = parseColor(accent)
  const page = parseColor(shell.page)
  if (fill === undefined || page === undefined) {
    return {
      fill: accent,
      hover: accent,
      disabled: accent,
      text: accent,
      textRatio: 1,
      wash: accent,
      gradient: shell.gradientStops,
    }
  }
  const text = readableOn(fill, page, shell.textDirection)
  const textColor = parseColor(text) ?? fill
  return {
    fill: toHex(fill),
    hover: toHex(darken(fill, HOVER_DARKEN)),
    disabled: withAlpha(fill, DISABLED_ALPHA),
    text,
    textRatio: contrast(textColor, page),
    wash: withAlpha(fill, WASH_ALPHA),
    gradient: accentGradient(accent, shell),
  }
}

/**
 * Render four stops as the ramp the stylesheet paints.
 * @param stops - the four literals.
 * @returns a `linear-gradient(...)` at the reference's own stop positions.
 */
export function gradientCss(stops: readonly string[]): string {
  const pairs = stops.map((stop, index) => `${stop} ${GRADIENT_POSITIONS[index] ?? '100%'}`)
  return `linear-gradient(90deg, ${pairs.join(', ')})`
}

/**
 * Render the same four stops as the 16% plate behind the wordmark.
 * @param stops - the four literals.
 * @returns a `linear-gradient(...)` of the same ramp at plate alpha.
 */
export function gradientPlateCss(stops: readonly string[]): string {
  const washes = stops.map((stop) => {
    const color = parseColor(stop)
    return color === undefined ? 'transparent' : withAlpha(color, PLATE_ALPHA)
  })
  return gradientCss(washes)
}

/**
 * Measure what one derived set's text value reaches on its shell's page.
 * @param set - the derived values.
 * @param shell - the shell they were derived for.
 * @returns the contrast ratio, or 0 when either literal is unreadable.
 */
export function textContrast(set: AccentSet, shell: TraeShell): number {
  const text = parseColor(set.text)
  const page = parseColor(shell.page)
  if (text === undefined || page === undefined) return 0
  return contrast(text, page)
}

/**
 * Whether a candidate would be accepted as an accent literal.
 * @param value - candidate literal.
 * @returns true when the value parses.
 * @remarks Re-exported so the card can validate a draft without reaching for the
 *          colour module directly.
 */
export function isAccent(value: unknown): boolean {
  return isColor(value)
}
