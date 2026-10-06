/**
 * The two colour shapes the arithmetic moves between.
 *
 * `Rgb` carries unrounded channels so a chain of mixes does not accumulate
 * rounding error; a literal is only ever written through `toHex`, which is what
 * quantizes it.
 */

/** A colour with unrounded channels. */
export interface Rgb {
  /** Red channel, 0…255. */
  readonly r: number
  /** Green channel, 0…255. */
  readonly g: number
  /** Blue channel, 0…255. */
  readonly b: number
}

/** A colour as hue, saturation and lightness, in degrees and percent. */
export interface Hsl {
  /** Hue, 0…360. */
  readonly h: number
  /** Saturation, 0…100. */
  readonly s: number
  /** Lightness, 0…100. */
  readonly l: number
}

/**
 * How far to move a colour through HSL.
 *
 * Named as offsets rather than as an {@link Hsl} so a reader cannot mistake one
 * for the other: an offset of `{ dh: 9, ds: 0, dl: 0 }` is a hue rotation, while
 * an `Hsl` of the same numbers would be a nearly black red.
 */
export interface HslOffset {
  /** Hue rotation, in degrees. */
  readonly dh: number
  /** Saturation shift, in percentage points. */
  readonly ds: number
  /** Lightness shift, in percentage points. */
  readonly dl: number
}
