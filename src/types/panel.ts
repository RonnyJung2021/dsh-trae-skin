/**
 * The card's own shapes: what the page hands the panel, what the panel renders
 * from the two locale dictionaries, and the derivation it prints.
 */

import type { PanelView } from '../enums/settings.ts'
import type { TraeScheme } from '../enums/scheme.ts'
import type { ErrorField, SectionField } from '../constants/config.ts'
import type { ConfigFormLike, TraeSection } from './settings.ts'

/** Props the plugin page and the inject face put on the panel. */
export interface TraePanelProps {
  /** Which view the page is drawing; the bundle card always asks for `page`. */
  readonly view?: PanelView
  /** The row's settings form. */
  readonly form: ConfigFormLike<TraeSection>
  /** Whether the boot global carried the knobs, i.e. the host half is current. */
  readonly hostPublished: boolean
}

/** One derived value and the contrast it was measured at, when it carries text. */
export interface DerivedValue {
  /** The literal the derivation lands on. */
  readonly value: string
  /** Its contrast ratio against the page it will be read on, when it is text. */
  readonly ratio?: string
}

/**
 * What the configured accent becomes, per shell.
 *
 * The card prints this because a colour typed by hand is a fill: whether it can
 * also carry text is a question only the shell's own page can answer, and the
 * answer is a measurement rather than a promise.
 */
export interface AccentPreview {
  /** The fill itself, quantized. */
  readonly fill: string
  /** The hover step derived from it. */
  readonly hover: string
  /** The 12% wash derived from it. */
  readonly wash: string
  /** Its text-safe variant against the light shell's page, with the ratio. */
  readonly textLight: DerivedValue
  /** Its text-safe variant against the dark shell's page, with the ratio. */
  readonly textDark: DerivedValue
  /** The four stops of the ramp it produces, and whether they are the reference's own. */
  readonly gradientLight: readonly string[]
  /** The same for the dark shell. */
  readonly gradientDark: readonly string[]
}

/** Every string the card renders. */
export interface PanelCopy {
  readonly noteReady: string
  readonly noteLoading: string
  readonly noteUnavailable: string
  readonly noteStaleHost: string
  readonly save: string
  readonly reset: string
  readonly stateSaved: string
  readonly stateDirty: string
  readonly stateClean: string
  readonly stateLocked: string
  /** Title of the block that prints the derivation. */
  readonly derived: string
  readonly derivedFill: string
  readonly derivedHover: string
  readonly derivedWash: string
  readonly derivedTextLight: string
  readonly derivedTextDark: string
  readonly derivedGradientLight: string
  readonly derivedGradientDark: string
  /** Title of the pulse block, which is its own section on purpose. */
  readonly pulseGroup: string
  /** Shown in place of the pulse block while the band is off. */
  readonly stripOffNote: string
  /** The shell choices, in the order the picker lists them. */
  readonly schemeOptions: readonly { readonly value: TraeScheme, readonly label: string }[]
  /** The two glow-colour modes. */
  readonly pulseColorOptions: readonly { readonly value: string, readonly label: string }[]
  /** Label and hint per knob. */
  readonly field: Readonly<Record<SectionField, { readonly label: string, readonly hint: string }>>
  /** Message per rejectable knob. */
  readonly error: Readonly<Record<ErrorField, string>>
}
