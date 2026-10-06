/**
 * The row's config section, as both halves and the card must agree on it.
 *
 * One list, because three places have to name the same fields in the same order:
 * the Host half publishes them into the page, the card lists them, and a save
 * writes them back as one revision.
 */

/** The knobs the card edits, in the order it lists them. */
export const SECTION_FIELDS = [
  'scheme',
  'accent',
  'wordmark',
  'strip',
  'stripBare',
  'pulse',
  'pulseColor',
  'pulseScale',
  'pulsePeriodMs',
  'pulseOpacity',
] as const

/** One knob the card edits. */
export type SectionField = typeof SECTION_FIELDS[number]

/**
 * The knobs a draft can be rejected on.
 * @remarks The five switches have no value the settings service could refuse, so
 *          they are absent here by construction rather than by an empty check.
 */
export const ERROR_FIELDS = [
  'scheme',
  'accent',
  'wordmark',
  'pulseColor',
  'pulseScale',
  'pulsePeriodMs',
  'pulseOpacity',
] as const

/** One knob an edit can be rejected on. */
export type ErrorField = typeof ERROR_FIELDS[number]

/**
 * The band's height in pixels.
 *
 * Not a setting: the reference's own header is one fixed row, and the wordmark's
 * face is derived from this value, so the two cannot drift apart.
 */
export const STRIP_HEIGHT = 32

/**
 * The indicator light's radius in pixels.
 *
 * The glow spreads to a multiple of this, which is why it is a length rather than
 * a diameter: `pulseScale` reads as "how far past its own edge the light reaches".
 */
export const LIGHT_RADIUS = 4
