/**
 * Resolving a row's config into the settings both halves use.
 *
 * The Host half owns the values (a cordis.yml row can change every one of them);
 * the browser half only reads the copy the Host publishes into the index page, so
 * this module stays dependency-free and runs in either face.
 *
 * Nothing here throws: a row config is deployment-varying input, and an invalid
 * field falls back to the documented default instead of leaving the GUI unpainted
 * or unreadable.
 */

import {
  DEFAULT_ACCENT,
  DEFAULT_ENABLED,
  DEFAULT_PULSE,
  DEFAULT_PULSE_COLOR,
  DEFAULT_PULSE_OPACITY,
  DEFAULT_PULSE_PERIOD_MS,
  DEFAULT_PULSE_SCALE,
  DEFAULT_SCHEME,
  DEFAULT_STRIP,
  DEFAULT_STRIP_BARE,
  DEFAULT_WORDMARK,
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
import type { TraeConfig, TraeSettings } from '../types/config.ts'
import { isColor } from './color.ts'
import { booleanOr, nonBlankText, numberOr } from './value.ts'

/**
 * Accept a wordmark only inside the length the band can render.
 *
 * An over-long wordmark is **refused** rather than truncated: falling back keeps
 * the band readable, and the card reports the length instead of saving something
 * the user did not type.
 * @param value - raw config value.
 * @param fallback - wordmark used when the value is unusable.
 * @returns the accepted wordmark.
 */
export function wordmarkOr(value: unknown, fallback: string): string {
  const text = nonBlankText(value, fallback)
  if (text.length < WORDMARK_MIN_LENGTH || text.length > WORDMARK_MAX_LENGTH) return fallback
  return text
}

/**
 * Accept one glow colour: the `follow` keyword, or a literal.
 * @param value - raw config value.
 * @param fallback - value used when the candidate is neither.
 * @returns the accepted choice, a literal lowercased.
 */
export function pulseColorOr(value: unknown, fallback: string): string {
  if (value === 'follow') return 'follow'
  if (isColor(value)) return (value as string).trim().toLowerCase()
  return fallback
}

/**
 * Resolve a partial cordis.yml row config into the settings both halves use.
 * @param config - raw row config, possibly undefined.
 * @returns the resolved settings; invalid fields fall back instead of throwing,
 * because a bad skin must never keep the GUI from booting.
 */
export function resolveSettings(config: TraeConfig | undefined): TraeSettings {
  const raw = config ?? {}
  return {
    scheme: isScheme(raw.scheme) ? raw.scheme : DEFAULT_SCHEME,
    accent: isColor(raw.accent) ? (raw.accent as string).trim().toLowerCase() : DEFAULT_ACCENT,
    wordmark: wordmarkOr(raw.wordmark, DEFAULT_WORDMARK),
    strip: booleanOr(raw.strip, DEFAULT_STRIP),
    stripBare: booleanOr(raw.stripBare, DEFAULT_STRIP_BARE),
    pulse: booleanOr(raw.pulse, DEFAULT_PULSE),
    pulseColor: pulseColorOr(raw.pulseColor, DEFAULT_PULSE_COLOR),
    pulseScale: numberOr(raw.pulseScale, DEFAULT_PULSE_SCALE, PULSE_SCALE_MIN, PULSE_SCALE_MAX),
    pulsePeriodMs: numberOr(raw.pulsePeriodMs, DEFAULT_PULSE_PERIOD_MS, PULSE_PERIOD_MIN_MS, PULSE_PERIOD_MAX_MS),
    pulseOpacity: numberOr(raw.pulseOpacity, DEFAULT_PULSE_OPACITY, PULSE_OPACITY_MIN, PULSE_OPACITY_MAX),
    enabled: booleanOr(raw.enabled, DEFAULT_ENABLED),
  }
}
