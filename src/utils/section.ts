/**
 * The card's settings section, as values rather than as a form.
 *
 * Everything here is what the card and the apply path do with one section: narrow
 * a hostile or stale one, refuse a draft the settings service would reject, and
 * turn an accepted draft into the edits that store it. The namespace and the field
 * lists live in `constants/`, the form surface in `types/settings.ts`.
 */

import {
  ERROR_FIELDS,
  SECTION_FIELDS,
  type ErrorField,
  type SectionField,
} from '../constants/config.ts'
import {
  PULSE_OPACITY_MAX,
  PULSE_OPACITY_MIN,
  PULSE_PERIOD_MAX_MS,
  PULSE_PERIOD_MIN_MS,
  PULSE_SCALE_MAX,
  PULSE_SCALE_MIN,
  WORDMARK_MAX_LENGTH,
  WORDMARK_MIN_LENGTH,
} from '../constants/plugin.ts'
import { isScheme } from '../enums/scheme.ts'
import type { SettingsPathOp, TraeSection } from '../types/settings.ts'
import { isColor } from './color.ts'
import { pulseColorOr, resolveSettings, wordmarkOr } from './config.ts'
import { isNumberWithin, isRecord } from './value.ts'

/**
 * Defaults for the card's reset control, taken from the plugin's one default
 * table: `resolveSettings` is what the browser half applies when the page carries
 * no published value, so the reset button lands on exactly that state.
 */
const DEFAULTS = resolveSettings(undefined)

/** Everything the 恢复默认 button writes back. */
export const SECTION_DEFAULTS: TraeSection = {
  scheme: DEFAULTS.scheme,
  accent: DEFAULTS.accent,
  wordmark: DEFAULTS.wordmark,
  strip: DEFAULTS.strip,
  stripBare: DEFAULTS.stripBare,
  pulse: DEFAULTS.pulse,
  pulseColor: DEFAULTS.pulseColor,
  pulseScale: DEFAULTS.pulseScale,
  pulsePeriodMs: DEFAULTS.pulsePeriodMs,
  pulseOpacity: DEFAULTS.pulseOpacity,
}

/**
 * Narrow one wordmark, or report that it cannot be used.
 * @param value - candidate.
 * @returns the trimmed text, or undefined when it is outside the band's range.
 */
function wordmarkWithin(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  if (text.length < WORDMARK_MIN_LENGTH || text.length > WORDMARK_MAX_LENGTH) return undefined
  return text
}

/**
 * Narrow one glow colour, or report that it cannot be used.
 * @param value - candidate.
 * @returns `follow`, a lowercased literal, or undefined.
 */
function pulseColorWithin(value: unknown): string | undefined {
  if (value === 'follow') return 'follow'
  if (isColor(value)) return (value as string).trim().toLowerCase()
  return undefined
}

/**
 * Narrow one form section to the config fields this plugin applies.
 *
 * The section arrives from the host as plain JSON: an older host half, a
 * hand-edited patch, or a value the schema rejected can all put something
 * unexpected here, and every caller treats a missing field as "keep what the boot
 * global said".
 * @param value - the raw section, when the form has one.
 * @returns the fields that are usable, possibly none.
 */
export function sectionOf(value: unknown): Partial<TraeSection> {
  if (!isRecord(value)) return {}
  const raw = value
  const section: Partial<TraeSection> = {}
  if (isScheme(raw.scheme)) section.scheme = raw.scheme
  if (isColor(raw.accent)) section.accent = (raw.accent as string).trim().toLowerCase()
  const wordmark = wordmarkWithin(raw.wordmark)
  if (wordmark !== undefined) section.wordmark = wordmark
  if (typeof raw.strip === 'boolean') section.strip = raw.strip
  if (typeof raw.stripBare === 'boolean') section.stripBare = raw.stripBare
  if (typeof raw.pulse === 'boolean') section.pulse = raw.pulse
  const pulseColor = pulseColorWithin(raw.pulseColor)
  if (pulseColor !== undefined) section.pulseColor = pulseColor
  if (isNumberWithin(raw.pulseScale, PULSE_SCALE_MIN, PULSE_SCALE_MAX)) {
    section.pulseScale = raw.pulseScale as number
  }
  if (isNumberWithin(raw.pulsePeriodMs, PULSE_PERIOD_MIN_MS, PULSE_PERIOD_MAX_MS)) {
    section.pulsePeriodMs = raw.pulsePeriodMs as number
  }
  if (isNumberWithin(raw.pulseOpacity, PULSE_OPACITY_MIN, PULSE_OPACITY_MAX)) {
    section.pulseOpacity = raw.pulseOpacity as number
  }
  return section
}

/**
 * Which knobs of one draft the settings service would have to reject.
 *
 * The checks are the ones the card can actually produce: a colour literal, a
 * bounded number, and a wordmark inside the band's range. `resolveSettings` would
 * fall back on all three, but falling back silently is exactly what a form must
 * not do — the user would press Save and watch the field revert with no reason
 * given.
 * @param section - the draft the card is holding.
 * @returns the offending fields, in the order the card lists them.
 */
export function invalidFields(section: TraeSection): ErrorField[] {
  const invalid: ErrorField[] = []
  if (!isScheme(section.scheme)) invalid.push('scheme')
  if (!isColor(section.accent)) invalid.push('accent')
  if (wordmarkWithin(section.wordmark) === undefined) invalid.push('wordmark')
  if (pulseColorWithin(section.pulseColor) === undefined) invalid.push('pulseColor')
  if (!isNumberWithin(section.pulseScale, PULSE_SCALE_MIN, PULSE_SCALE_MAX)) invalid.push('pulseScale')
  if (!isNumberWithin(section.pulsePeriodMs, PULSE_PERIOD_MIN_MS, PULSE_PERIOD_MAX_MS)) {
    invalid.push('pulsePeriodMs')
  }
  if (!isNumberWithin(section.pulseOpacity, PULSE_OPACITY_MIN, PULSE_OPACITY_MAX)) {
    invalid.push('pulseOpacity')
  }
  return invalid
}

/**
 * The edits that write one whole section.
 * @param section - the values to write.
 * @returns one `set` per knob, so the Settings service fences them as one revision.
 */
export function sectionOps(section: TraeSection): SettingsPathOp[] {
  return SECTION_FIELDS.map(field => ({
    op: 'set' as const,
    path: [field] as readonly string[],
    value: section[field as SectionField] as unknown,
  }))
}

/**
 * Fill a partial section out to a whole one.
 * @param section - whatever the form had.
 * @returns every knob, missing ones at their default.
 */
export function completeSection(section: Partial<TraeSection> | undefined): TraeSection {
  return { ...SECTION_DEFAULTS, ...(section ?? {}) }
}

/**
 * Whether a draft differs from what is stored.
 * @param draft - the values being edited.
 * @param committed - the values the settings service last accepted.
 * @returns true when any knob differs, or when nothing has been accepted yet.
 */
export function isDirty(draft: TraeSection, committed: TraeSection | undefined): boolean {
  if (committed === undefined) return true
  return SECTION_FIELDS.some(field => committed[field] !== draft[field])
}

/**
 * The knobs the card can report on, so a test can prove the list is exhaustive.
 * @remarks Exported rather than inlined into `invalidFields`, because the point is
 *          to compare two lists that are maintained apart.
 */
export { ERROR_FIELDS }
