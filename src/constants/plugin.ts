/**
 * Identity and compiled defaults of the plugin.
 *
 * One table, read by both halves: the Host half publishes {@link DEFAULT_GLOBAL_NAME}
 * and falls back to these values when a row configures nothing, and the browser
 * half compiles the very same values in — an unedited row therefore paints exactly
 * what the page would paint on its own.
 */

import type { TraeScheme } from '../enums/scheme.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const PLUGIN_ID = 'dsh-trae-skin'

/**
 * Settings namespace owned by this plugin's loader row.
 * @remarks The engine names a row's settings namespace after the row itself, so
 *          this is the package name. Writes through it land in the profile patch,
 *          which is the only durable store this plugin has: page `localStorage` is
 *          keyed by the engine's port, and the port changes on every launch.
 */
export const SETTINGS_NAMESPACE = PLUGIN_ID

/** Global the Host publishes for the browser half. */
export const DEFAULT_GLOBAL_NAME = '__DSH_TRAE_SKIN__'

/** The reference site's own accent, `--bg-bg-brand` on `trae.cn`. */
export const DEFAULT_ACCENT = '#32f08c'

/** The wordmark on the status band; the reference uses its own wordmark in that slot. */
export const DEFAULT_WORDMARK = 'DEEPSEEK HARNESS'

/**
 * Shell painted when the row configures none.
 *
 * `dark` rather than `auto`, and this is a decision rather than an oversight: the
 * reference site is a dark-first product with no light mode at all, so following
 * the product would hand a light-system user a design that product never shipped.
 */
export const DEFAULT_SCHEME: TraeScheme = 'dark'

/** Whether the top status band is painted when the row configures nothing. */
export const DEFAULT_STRIP = true

/** Whether that band drops its own fill and its foot rule. */
export const DEFAULT_STRIP_BARE = false

/** Whether the indicator light breathes while the product reports reasoning. */
export const DEFAULT_PULSE = true

/** Glow colour: derive it from the accent, the default, or take a literal. */
export const DEFAULT_PULSE_COLOR = 'follow'

/** Glow spread as a multiple of the light's own radius. */
export const DEFAULT_PULSE_SCALE = 1.6

/** One breath, in milliseconds. */
export const DEFAULT_PULSE_PERIOD_MS = 1600

/** Peak opacity of the glow. */
export const DEFAULT_PULSE_OPACITY = 0.35

/** Whether the skin publishes at all when the row configures nothing. */
export const DEFAULT_ENABLED = true

/** Shortest wordmark the status band accepts; shorter is refused, not padded. */
export const WORDMARK_MIN_LENGTH = 1

/**
 * Longest wordmark the status band accepts.
 *
 * Over-long text is **refused** rather than truncated, so the card can say which
 * field is wrong instead of quietly saving something else.
 */
export const WORDMARK_MAX_LENGTH = 24

/** Smallest glow spread the card accepts. */
export const PULSE_SCALE_MIN = 1.2

/** Largest glow spread the card accepts. */
export const PULSE_SCALE_MAX = 2.4

/** Fastest breath the card accepts, in milliseconds. */
export const PULSE_PERIOD_MIN_MS = 800

/** Slowest breath the card accepts, in milliseconds. */
export const PULSE_PERIOD_MAX_MS = 4000

/** Faintest glow the card accepts. */
export const PULSE_OPACITY_MIN = 0.1

/** Strongest glow the card accepts. */
export const PULSE_OPACITY_MAX = 0.6
