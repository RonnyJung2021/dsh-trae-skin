/**
 * The three scheme choices a row may pin.
 *
 * A closed set rather than free text: the schema accepts exactly these, the card
 * lists them, and `resolveSettings` falls back to the default for anything else —
 * a bad skin must never keep the GUI from booting. The union type is derived from
 * the tuple, so the accepted values and the type cannot drift apart.
 */

/** Allowed scheme choices: the reference's page, its light counterpart, or the product's own state. */
export const SCHEMES = ['dark', 'light', 'auto'] as const

/** Which shell the skin paints; `auto` follows the product's own light/dark state. */
export type TraeScheme = typeof SCHEMES[number]

/**
 * Whether a value is one of the accepted scheme choices.
 * @param value - candidate.
 * @returns true when the value is a {@link TraeScheme}.
 */
export function isScheme(value: unknown): value is TraeScheme {
  return typeof value === 'string' && (SCHEMES as readonly string[]).includes(value)
}
