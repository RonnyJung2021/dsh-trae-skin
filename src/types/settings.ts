/**
 * The settings-card contract, narrowed to the calls this plugin makes.
 *
 * The engine's own services are wider than a skin needs; these interfaces are the
 * slice the card and the apply path actually touch, so a service change shows up
 * as one type to fix rather than as an untyped call site.
 */

import type { FormStatus, HostState, PathOp } from '../enums/settings.ts'
import type { TraeScheme } from '../enums/scheme.ts'

/** The volatile section of this row's config — exactly what the card edits. */
export interface TraeSection {
  /** Which shell to paint; `auto` follows the product's own light/dark state. */
  scheme: TraeScheme
  /** Accent as a fill, `#rrggbb`. */
  accent: string
  /** Text on the status band's plate. */
  wordmark: string
  /** Whether the top status band is painted at all. */
  strip: boolean
  /** Whether that band drops its own fill and its foot rule. */
  stripBare: boolean
  /** Whether the indicator light breathes while the product reports reasoning. */
  pulse: boolean
  /** Glow colour: `follow` derives it from the accent, or a `#rrggbb` literal. */
  pulseColor: string
  /** Glow spread as a multiple of the light's own radius. */
  pulseScale: number
  /** One breath, in milliseconds. */
  pulsePeriodMs: number
  /** Peak opacity of the glow. */
  pulseOpacity: number
}

/** The current form state for one namespace, as the client half reads it. */
export interface ConfigFormView<T> {
  /** `loading` until the first accepted section, `unavailable` without a transport. */
  status: FormStatus
  /** Last accepted section, undefined before the first acceptance. */
  value: T | undefined
  /** Whether the host document accepts writes. */
  writable: boolean
}

/** One path-addressed edit, as the Settings service takes it. */
export interface SettingsPathOp {
  /** `set` writes the value; `unset` restores the composition layer. */
  op: PathOp
  /** Field path inside the row's config section. */
  path: readonly string[]
  /** Value for `set`. */
  value?: unknown
}

/** The Settings-form surface this plugin uses, narrowed to what it calls. */
export interface ConfigFormLike<T> {
  /** @returns the current form state. */
  getSnapshot(): ConfigFormView<T>
  /** Observe state changes. */
  subscribe(listener: () => void): () => void
  /** Queue edits, all fenced by one revision. */
  mutate(ops: readonly SettingsPathOp[]): Promise<boolean>
}

/** The `configForms` service, narrowed to the one method this plugin calls. */
export interface ConfigFormsLike {
  /** @returns the form for one settings namespace. */
  get<T>(namespace: string): ConfigFormLike<T>
}

/** The slots registry, narrowed to the calls this plugin makes. */
export interface SlotRegistryLike {
  /** Wait for a slot declaration, then contribute. */
  inject(name: string, proceed: () => void): void
  /** Contribute one entry to a declared slot. */
  register(options: Record<string, unknown>, component: unknown): unknown
}

/** Whether the page's boot global carries this row's knobs. */
export type { HostState }
