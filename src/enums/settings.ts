/**
 * The enumerations the settings-card bridge speaks.
 *
 * They are the values the Settings service and the slot registry exchange with
 * this plugin, so they are named once here rather than written out at each use.
 */

/** Where one namespace's form is in its lifecycle. */
export const FORM_STATUSES = ['loading', 'ready', 'unavailable'] as const

/** `loading` until the first accepted section, `unavailable` without a transport. */
export type FormStatus = typeof FORM_STATUSES[number]

/** What one path-addressed edit does. */
export const PATH_OPS = ['set', 'unset'] as const

/** `set` writes the value; `unset` restores the composition layer. */
export type PathOp = typeof PATH_OPS[number]

/** Which view the page is drawing. */
export const PANEL_VIEWS = ['item', 'page'] as const

/** The bundle card always asks for `page`. */
export type PanelView = typeof PANEL_VIEWS[number]

/** Whether the page's boot global came from a host half that knows these knobs. */
export const HOST_STATES = ['current', 'stale'] as const

/** `current` when the boot global carries the knobs, `stale` when it does not. */
export type HostState = typeof HOST_STATES[number]
