/**
 * The palette's shapes: what the skin is painted from, and what comes out.
 */

import type { TraeScheme } from '../enums/scheme.ts'

/** Every input one paint of the skin reads. */
export interface TraeSkinInput {
  /** Configured scheme choice; `auto` follows the document's own dark attribute. */
  readonly scheme: TraeScheme
  /** Accent as a fill, a `#rrggbb` literal. */
  readonly accent: string
  /** Whether the band is painted at all. */
  readonly strip: boolean
  /** Whether the band drops its fill and its foot rule. */
  readonly stripBare: boolean
  /** Whether the light breathes while the product reports reasoning. */
  readonly pulse: boolean
  /** Glow colour: `follow` derives it from the accent, or a literal. */
  readonly pulseColor: string
  /** Glow spread as a multiple of the light's own radius. */
  readonly pulseScale: number
  /** One breath, in milliseconds. */
  readonly pulsePeriodMs: number
  /** Peak opacity of the glow. */
  readonly pulseOpacity: number
}

/**
 * One accent, as the six values the stylesheet spends it as.
 *
 * Every one of them derives from the single literal the user typed, which is the
 * whole point: a colour that works as a fill is not automatically one that works
 * as text, and a hover step taken from the shell would keep the reference's own
 * green while the button it belongs to had already changed colour.
 */
export interface AccentSet {
  /** The fill, quantized to `#rrggbb`. */
  readonly fill: string
  /** One step darker, for hover. */
  readonly hover: string
  /** The same fill at a third alpha, for a disabled primary button. */
  readonly disabled: string
  /** The literal to use where the accent is rendered as text. */
  readonly text: string
  /** The contrast {@link text} reaches against the shell's page. */
  readonly textRatio: number
  /** The fill at 12% alpha, the reference's own informational wash. */
  readonly wash: string
  /** The four stops of the wordmark ramp. */
  readonly gradient: readonly string[]
}

/** The dynamic properties one paint writes, name to value. */
export type SkinVariables = Readonly<Record<string, string>>
