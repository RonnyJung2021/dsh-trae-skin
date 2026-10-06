/**
 * What a row may configure, and what both halves resolve it to.
 *
 * These live in one module because the Host half and the browser half must agree
 * on the shape field by field: the Host resolves a row into {@link TraeSettings}
 * and publishes it, the browser half reads the very same shape back.
 */

import type { TraeScheme } from '../enums/scheme.ts'

/** Resolved settings both halves agree on. */
export interface TraeSettings {
  /** Which shell to paint; `auto` follows the product's own light/dark state. */
  readonly scheme: TraeScheme
  /** Accent as a fill, `#rrggbb`. Its text variant and both ramps derive from it. */
  readonly accent: string
  /** Text on the status band's plate. */
  readonly wordmark: string
  /** Whether the top status band is painted at all. */
  readonly strip: boolean
  /** Whether that band drops its own fill and its foot rule. */
  readonly stripBare: boolean
  /** Whether the indicator light breathes while the product reports reasoning. */
  readonly pulse: boolean
  /** Glow colour: `follow` derives it from the accent, or a `#rrggbb` literal. */
  readonly pulseColor: string
  /** Glow spread as a multiple of the light's own radius. */
  readonly pulseScale: number
  /** One breath, in milliseconds. */
  readonly pulsePeriodMs: number
  /** Peak opacity of the glow. */
  readonly pulseOpacity: number
  /** Whether the skin renders at all. */
  readonly enabled: boolean
}

/** Every field optional: omitted values fall back to the module defaults. */
export interface TraeConfig {
  readonly scheme?: unknown
  readonly accent?: unknown
  readonly wordmark?: unknown
  readonly strip?: unknown
  readonly stripBare?: unknown
  readonly pulse?: unknown
  readonly pulseColor?: unknown
  readonly pulseScale?: unknown
  readonly pulsePeriodMs?: unknown
  readonly pulseOpacity?: unknown
  readonly enabled?: unknown
}
