/**
 * The names the skin's DOM, stylesheet, and modules agree on.
 *
 * They live in one module because a rename here has to reach a CSS selector, an
 * attribute the applier toggles, and the tests at once.
 */

/** Id of the injected `<style>`; a second install reuses the same element. */
export const STYLE_ID = 'dsh-trae-styles'

/** Body attribute marking the skin as active; every override hangs off it. */
export const SKIN_ATTRIBUTE = 'data-dsh-trae'

/** Body attribute naming the live shell: `light` or `dark`. */
export const SCHEME_ATTRIBUTE = 'data-dsh-trae-scheme'

/** Body attribute carrying the activity the breathing light follows. */
export const ACTIVITY_ATTRIBUTE = 'data-dsh-trae-activity'

/** Body attribute carrying whether the light breathes at all: `on` or `off`. */
export const PULSE_ATTRIBUTE = 'data-dsh-trae-pulse'

/** Body attribute carrying the band's shape: `full`, `bare` or `off`. */
export const STRIP_ATTRIBUTE = 'data-dsh-trae-strip'

/** Body attribute the product's own theme runtime owns. */
export const THEME_DARK_ATTRIBUTE = 'data-ds-dark-theme'

/** Attribute the product publishes while a turn is being produced. */
export const STREAMING_ATTRIBUTE = 'data-streaming'

/** The product's documented composer-card hook. */
export const COMPOSER_ATTRIBUTE = 'data-composer-card'

/** The product's documented menu-surface hook. */
export const MENU_ATTRIBUTE = 'data-menu-material'

/**
 * The product's documented window-drag hook.
 *
 * The shell turns this attribute into the one darwin drag rule, which is how a
 * markup node — not a stylesheet — declares itself part of the window's movable
 * geometry.
 */
export const WINDOW_DRAG_ATTRIBUTE = 'data-window-drag'

/** Class of the fixed status band across the top of the page. */
export const STRIP_CLASS = 'dsh-trae-strip'

/** Class of the 16% gradient plate the wordmark sits on. */
export const PLATE_CLASS = 'dsh-trae-strip-plate'

/** Class of the gradient wordmark itself. */
export const MARK_CLASS = 'dsh-trae-strip-mark'

/** Class of the indicator light. */
export const LAMP_CLASS = 'dsh-trae-strip-lamp'

/** Class of the light's state, in words, for assistive technology. */
export const STATE_CLASS = 'dsh-trae-strip-state'

/** Attribute marking the card's own stylesheet, so one install can be disposed. */
export const PANEL_STYLE_ATTRIBUTE = 'data-dsh-trae-panel-styles'
