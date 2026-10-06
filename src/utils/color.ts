/**
 * Colour arithmetic for the one appearance field a user types by hand.
 *
 * Both halves need it, so the module stays dependency-free and runs in either
 * face: the Host uses {@link isColor} to decide whether a configured accent is
 * usable, and the browser half uses {@link readableOn} to answer the question the
 * accent alone cannot — what the same hue looks like as *text*.
 *
 * The reference's own accent, `#32f08c`, is 13.11:1 on its `#0a0b0d` page, so on
 * the dark shell it is already both. On a white page it is 1.82:1 — a fine fill,
 * an unreadable link — which is why the skin always derives a second value rather
 * than trusting the one the user picked.
 */

import type { Hsl, HslOffset, Rgb } from '../types/color.ts'
import type { TextDirection } from '../enums/shell.ts'

/** Accepted literal forms: `#rgb`, `#rrggbb`. */
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu

/** Contrast floor a colour must reach before it may be rendered as text. */
export const AA_TEXT_CONTRAST = 4.5

/** What a mix moves toward when it darkens. */
const BLACK: Rgb = { r: 0, g: 0, b: 0 }

/** What a mix moves toward when it lightens. */
const WHITE: Rgb = { r: 255, g: 255, b: 255 }

/**
 * Read a colour literal.
 * @param value - candidate literal.
 * @returns the colour, or undefined when the literal is not one this module writes.
 */
export function parseColor(value: unknown): Rgb | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  if (!HEX.test(text)) return undefined
  const digits = text.slice(1)
  const full = digits.length === 3
    ? digits.split('').map(digit => `${digit}${digit}`).join('')
    : digits
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

/**
 * Whether a value is a colour literal this module can use.
 * @param value - candidate literal.
 * @returns true when {@link parseColor} accepts it.
 */
export function isColor(value: unknown): boolean {
  return parseColor(value) !== undefined
}

/**
 * Write a colour as `#rrggbb`.
 *
 * Channels are rounded **and clamped** before they are printed: a colour that came
 * out of HSL arithmetic can land a fraction outside the byte range, and
 * `(300).toString(16)` is three digits while `(-20).toString(16)` carries a sign —
 * either would produce a literal no browser can read.
 * @param color - colour to write.
 * @returns the lowercase literal, channels rounded to whole bytes.
 */
export function toHex(color: Rgb): string {
  const channel = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`
}

/**
 * Round a colour to the bytes its own literal would carry.
 *
 * This is the step that makes a contrast measurement honest: `toHex` rounds, and
 * rounding alone can pull 4.50 down to 4.48, so every derived value is quantized
 * before it is measured rather than after.
 * @param color - colour to quantize.
 * @returns the colour as its literal would be read back.
 */
export function quantize(color: Rgb): Rgb {
  return parseColor(toHex(color)) ?? color
}

/**
 * Mix a colour toward another one.
 * @param from - colour to start at.
 * @param to - colour to move toward.
 * @param amount - 0 keeps `from`, 1 arrives at `to`.
 * @returns the mixed colour.
 */
export function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  const at = Math.min(1, Math.max(0, amount))
  return {
    r: from.r + (to.r - from.r) * at,
    g: from.g + (to.g - from.g) * at,
    b: from.b + (to.b - from.b) * at,
  }
}

/**
 * Darken a colour toward black.
 * @param color - colour to move.
 * @param amount - 0 keeps it, 1 arrives at black.
 * @returns the darker colour.
 */
export function darken(color: Rgb, amount: number): Rgb {
  return mix(color, BLACK, amount)
}

/**
 * Lighten a colour toward white.
 * @param color - colour to move.
 * @param amount - 0 keeps it, 1 arrives at white.
 * @returns the lighter colour.
 */
export function lighten(color: Rgb, amount: number): Rgb {
  return mix(color, WHITE, amount)
}

/**
 * WCAG relative luminance.
 * @param color - colour to measure.
 * @returns luminance, 0 (black) … 1 (white).
 */
export function luminance(color: Rgb): number {
  const channel = (value: number): number => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

/**
 * WCAG contrast ratio between two colours.
 * @param a - one colour.
 * @param b - the other.
 * @returns the ratio, 1 … 21, order-independent.
 */
export function contrast(a: Rgb, b: Rgb): number {
  const first = luminance(a)
  const second = luminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * The same hue, moved far enough from the page to be legible as text.
 *
 * The direction is the shell's, not a preference: a white page is fixed by
 * darkening and a near-black one by lightening, which is also the direction that
 * raises contrast in each. A colour that already clears {@link AA_TEXT_CONTRAST}
 * is returned unchanged, so the accent stays the reference's own value wherever
 * it can.
 *
 * The ramp is monotonic in contrast, so walking it once and stopping at the first
 * passing step lands on the closest value that clears the floor; the value is
 * quantized before it is measured, because rounding alone can drop it back under.
 * @param color - the accent as a fill.
 * @param page - the shell's page colour, i.e. what the text will sit on.
 * @param direction - which way to move: `darken` on a light page, `lighten` on a dark one.
 * @param floor - contrast ratio to reach; defaults to the AA text floor.
 * @returns the literal to use where the accent is rendered as text.
 */
export function readableOn(
  color: Rgb,
  page: Rgb,
  direction: TextDirection,
  floor: number = AA_TEXT_CONTRAST,
): string {
  const start = quantize(color)
  if (contrast(start, page) >= floor) return toHex(start)
  const target: Rgb = direction === 'darken' ? BLACK : WHITE
  const steps = 100
  for (let step = 1; step <= steps; step += 1) {
    const candidate = quantize(mix(start, target, step / steps))
    if (contrast(candidate, page) >= floor) return toHex(candidate)
  }
  return toHex(target)
}

/**
 * Split a colour into hue, saturation and lightness.
 * @param color - colour to split.
 * @returns hue in degrees, saturation and lightness in percent.
 */
export function toHsl(color: Rgb): Hsl {
  const r = color.r / 255
  const g = color.g / 255
  const b = color.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const span = max - min
  let h = 0
  if (span !== 0) {
    if (max === r) h = ((g - b) / span) % 6
    else if (max === g) h = (b - r) / span + 2
    else h = (r - g) / span + 4
    h *= 60
    if (h < 0) h += 360
  }
  const l = (max + min) / 2
  const s = span === 0 ? 0 : span / (1 - Math.abs(2 * l - 1))
  return { h, s: s * 100, l: l * 100 }
}

/**
 * Rebuild a colour from hue, saturation and lightness.
 * @param hsl - the three channels; hue wraps, the other two are clamped.
 * @returns the quantized colour.
 */
export function fromHsl(hsl: Hsl): Rgb {
  const h = ((hsl.h % 360) + 360) % 360
  const s = Math.min(100, Math.max(0, hsl.s)) / 100
  const l = Math.min(100, Math.max(0, hsl.l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const sector = Math.floor(h / 60) % 6
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector] as [number, number, number]
  return quantize({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 })
}

/**
 * Move a colour through HSL by fixed offsets.
 * @param color - colour to move.
 * @param offset - hue degrees, saturation points and lightness points to add.
 * @returns the moved, quantized colour.
 */
export function shift(color: Rgb, offset: HslOffset): Rgb {
  const hsl = toHsl(color)
  return fromHsl({ h: hsl.h + offset.dh, s: hsl.s + offset.ds, l: hsl.l + offset.dl })
}

/**
 * Write a colour as a literal with an alpha suffix.
 * @param color - colour to write.
 * @param alpha - 0…1; outside that range is clamped.
 * @returns the eight-digit `#rrggbbaa` literal the stylesheet reads.
 */
export function withAlpha(color: Rgb, alpha: number): string {
  const byte = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
  return `${toHex(color)}${byte.toString(16).padStart(2, '0')}`
}

/**
 * Format a measured ratio the way the card prints it.
 * @param ratio - the contrast ratio.
 * @returns the ratio to two decimals, with its unit.
 */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`
}
