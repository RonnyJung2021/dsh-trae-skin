/**
 * The skin's stylesheet, plus the one-time installer.
 *
 * Five layers, in order:
 *
 * 1. **The band.** A fixed row across the top of the window: the indicator light,
 *    the gradient wordmark on its 16% plate, and the state in words. The page is
 *    padded down by exactly the band's height, so the mark owns a row instead of
 *    crossing the application's chrome.
 * 2. **The chrome block.** The three faces, the radius scale, the focus ring and
 *    the scrollbar thumbs — the same in both shells, so they are declared once.
 * 3. **The product-token remap.** Every `--dsw-*` alias the interface paints with is
 *    pointed at a skin variable. This is the whole skin for the surfaces the product
 *    already draws: DSH already expresses its chrome as
 *    `0.5px solid var(--dsw-alias-border-l3)`, so repainting one border token
 *    repaints the sidebar rule, the header rule and every menu edge at once, with no
 *    selector that could go stale against a renamed class.
 * 4. **The two shell blocks.** One set of values per shell, selected by the
 *    attribute the applier writes. Both blocks match a body carrying the skin
 *    attribute at the same specificity, so **the dark block must stay after the
 *    light one** — source order is what makes it win. They cannot be merged into the
 *    remap block, because a single set of values cannot be both the near-black page
 *    and a white one.
 * 5. **The product's own documented hooks.** The composer card, the menu material,
 *    the switch's two states and the focus offset.
 *
 * Deliberately **not remapped**, because DSH already switches them for us on
 * `body[data-ds-dark-theme]` and pinning them would flatten both shells onto one set
 * of values: the state colours (warn / success / error), the toast and tooltip
 * surfaces, the coloured diff backgrounds, and the syntax palette.
 *
 * Nothing here targets a hashed CSS-module class. The only selectors are this
 * plugin's own classes and attributes, the product's documented `data-` hooks, the
 * switch's own `role`/`aria-checked`, `body` / `#root`, and `:has()` over the
 * composer's documented hook — which the shell itself uses too.
 *
 * Deliberately absent, because the reference site has none of them anywhere in its
 * stylesheets: `radial-gradient`, `backdrop-filter`, `mix-blend-mode`, `filter:
 * blur()` and any noise texture. Its depth is flat — hairlines and one soft drop.
 */

import {
  ACTIVITY_ATTRIBUTE,
  COMPOSER_ATTRIBUTE,
  LAMP_CLASS,
  MARK_CLASS,
  MENU_ATTRIBUTE,
  PLATE_CLASS,
  PULSE_ATTRIBUTE,
  SCHEME_ATTRIBUTE,
  SKIN_ATTRIBUTE,
  STATE_CLASS,
  STRIP_ATTRIBUTE,
  STRIP_CLASS,
  STYLE_ID,
} from '../../constants/dom.ts'
import { LIGHT_RADIUS, STRIP_HEIGHT } from '../../constants/config.ts'
import {
  ALIAS_MAP,
  CHROME_VARIABLES,
  DARK_SHELL,
  FONT_VARIABLES,
  LIGHT_SHELL,
} from '../../constants/palette.ts'
import { shellDeclarations } from '../palette.ts'

/** Install the stylesheet once per page. */
export function installPageStyles(doc: Document = document): () => void {
  const existing = doc.getElementById(STYLE_ID)
  if (existing !== null) return () => {}
  const element = doc.createElement('style')
  element.id = STYLE_ID
  element.textContent = pageStyles()
  doc.head.append(element)
  return () => { element.remove() }
}

/**
 * One block's body, from a table of name and value pairs.
 * @param pairs - the pairs to write.
 * @param important - whether each declaration must win over the product's own.
 * @returns one indented declaration per line.
 */
function declarations(pairs: readonly (readonly [string, string])[], important = false): string {
  const suffix = important ? ' !important' : ''
  return pairs.map(([name, value]) => `  ${name}: ${value}${suffix};`).join('\n')
}

/**
 * The stylesheet.
 *
 * Exported for tests, which assert the contract this module documents: which tokens
 * are remapped, which are deliberately left to the product, that the dark block sits
 * after the light one, and that none of the four things the reference never uses can
 * appear here.
 * @returns the CSS text.
 */
export function pageStyles(): string {
  const skin = `body[${SKIN_ATTRIBUTE}]`
  const radius = `${LIGHT_RADIUS}px`
  const diameter = `${LIGHT_RADIUS * 2}px`
  return `
/* -------------------------------------------------------------- the band -- */

.${STRIP_CLASS} {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  block-size: ${STRIP_HEIGHT}px;
  padding-inline: 16px;
  background: var(--dsh-trae-page);
  /* The reference draws every separator as a 1px line, never a thicker one. */
  border-block-end: 1px solid var(--dsh-trae-rule-l3);
  color: var(--dsh-trae-muted);
  font-family: var(--dsh-trae-font-mono);
  font-size: 12px;
  line-height: 15.6px;
  /* Read-only display: nothing on the band is clickable. */
  user-select: none;
  /* The shell subtracts every direct child of body from the window's drag region,
     and the band now owns the top of the window — so it declares its own drag
     region with the product's documented hook, and re-asserts it here because that
     subtraction is what a body child gets by default. */
  -webkit-app-region: drag !important;
}

/* Content only: the plate's fill and the foot rule go, the content stays. */
${skin}[${STRIP_ATTRIBUTE}='bare'] .${STRIP_CLASS} {
  background: transparent;
  border-block-end-color: transparent;
}

/* The reference's own gradient-tag format: a 16% underlay of the same four stops,
   with the wordmark itself clipped out of the full-strength ramp. */
.${PLATE_CLASS} {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  max-inline-size: 60%;
  block-size: 18px;
  padding-inline: 4px;
  border-radius: 2px;
  overflow: hidden;
  background: var(--dsh-trae-gradient-plate);
}

.${MARK_CLASS} {
  font-family: var(--dsh-trae-font-mono);
  font-size: 12px;
  /* The reference's own label weight: its 400/500/600 all point at one Regular
     file, so a heavier mono face does not exist — and is not faked here either. */
  font-weight: 500;
  line-height: 15.6px;
  letter-spacing: 0.1px;
  white-space: nowrap;
  background: var(--dsh-trae-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Idle is a ring. */
.${LAMP_CLASS} {
  position: relative;
  flex: none;
  inline-size: ${diameter};
  block-size: ${diameter};
  border-radius: 50%;
  /* The shell curves every rounded corner along a superellipse; a circle has to opt
     back out of that, or the lamp is drawn as a squircle. */
  corner-shape: round;
  border: 1px solid var(--dsh-trae-accent-text);
  background: transparent;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Filled while the composer has focus, and while the pointer is over it or over the
   band itself. Three separate rules rather than one selector list, so an engine
   without :has() still gets the band's own hover. */
${skin} .${STRIP_CLASS}:hover .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

${skin}:has([${COMPOSER_ATTRIBUTE}]:focus-within) .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

${skin}:has([${COMPOSER_ATTRIBUTE}]:hover) .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

/* The glow has no size of its own until it spreads. */
.${LAMP_CLASS}::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  corner-shape: round;
  opacity: 0;
  pointer-events: none;
}

/* The glow spreads only while the product reports that it is reasoning. When the
   product publishes no streaming signal at all the reading is 'unknown', and the
   light breathes on that too: a motionless dot reads as "not working". */
${skin}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='running'] .${LAMP_CLASS}::after,
${skin}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='unknown'] .${LAMP_CLASS}::after {
  animation: dsh-trae-breathe var(--dsh-trae-pulse-period) cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes dsh-trae-breathe {
  0% {
    box-shadow: 0 0 0 0 var(--dsh-trae-pulse-color);
    opacity: var(--dsh-trae-pulse-opacity);
  }
  70% {
    box-shadow: 0 0 0 calc(${radius} * var(--dsh-trae-pulse-scale)) transparent;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
    opacity: 0;
  }
}

/* Same period, no travel: a stopped light reads as a frozen one, so the
   reduced-motion path fades in place instead of holding still. */
@keyframes dsh-trae-breathe-still {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: var(--dsh-trae-pulse-opacity);
  }
}

@media (prefers-reduced-motion: reduce) {
  ${skin}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='running'] .${LAMP_CLASS}::after,
  ${skin}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='unknown'] .${LAMP_CLASS}::after {
    animation-name: dsh-trae-breathe-still;
  }

  .${LAMP_CLASS} {
    transition: none;
  }
}

/* The light's state, in words, for assistive technology. The band is a status
   region, so this is the text it announces; it is never painted. */
.${STATE_CLASS} {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ------------------------------------------------------------------ mount -- */

/* The band is a fixed layer, so the app makes room for it rather than being covered
   by it. border-box keeps the product's own height: 100% chain intact: the padding
   comes out of the box instead of extending it. */
${skin} #root {
  box-sizing: border-box;
  padding-block-start: ${STRIP_HEIGHT}px;
}

/* Off means the band is not in the document at all, and the page closes up. */
${skin}[${STRIP_ATTRIBUTE}='off'] #root {
  padding-block-start: 0;
}

${skin} {
  font-family: var(--dsh-trae-font-ui);
  color: var(--dsh-trae-ink);
  background-color: var(--dsh-trae-page);
  /* The reference paints its page with a flat fill and never with an image. */
  background-image: none;
}

/* -------------------------------------------------------------- elevation -- */

/* The product declares the three elevation tiers per element (body, body *), so a
   value set on the body alone is shadowed on every descendant and inheritance
   cannot carry one. The recipe is the reference's own: a half-pixel inner highlight
   plus one soft drop, and in the light shell the corrected weight for a white
   page. */
${skin},
${skin} * {
  --dsw-elevation-panel: var(--dsh-trae-elevation) !important;
  --dsw-elevation-prominent: var(--dsh-trae-elevation-prominent) !important;
  --dsw-elevation-soft: var(--dsh-trae-elevation-soft) !important;
}

/* --------------------------------------------------- chrome, both shells -- */

${skin} {
${declarations(FONT_VARIABLES)}

${declarations(CHROME_VARIABLES, true)}

${declarations(ALIAS_MAP, true)}
}

/* Form controls do not inherit a font from the document, so the interface face has
   to be named on them explicitly. */
${skin} input,
${skin} textarea,
${skin} select,
${skin} button {
  font-family: inherit;
}

/* -------------------------------------------------------------- light shell -- */

/* Written first; the dark block below is the compiled default and has to win on a
   document that somehow matches both. */
${skin}[${SCHEME_ATTRIBUTE}='light'] {
  color-scheme: light;

${declarations(shellDeclarations(LIGHT_SHELL))}
}

/* --------------------------------------------------------------- dark shell -- */

${skin}[${SCHEME_ATTRIBUTE}='dark'] {
  color-scheme: dark;

${declarations(shellDeclarations(DARK_SHELL))}
}

/* ------------------------------------------------ the product's own hooks -- */

/* The one documented composer hook: an opaque card with a hairline, which is the
   reference's own input card. */
${skin} [${COMPOSER_ATTRIBUTE}] {
  background: var(--dsh-trae-raised) !important;
  border: 1px solid var(--dsh-trae-rule-l2) !important;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

${skin} [${COMPOSER_ATTRIBUTE}]:focus-within {
  border-color: var(--dsh-trae-accent) !important;
}

/* A menu is the one surface that should read as floating paper. */
${skin} [${MENU_ATTRIBUTE}] {
  border: 1px solid var(--dsh-trae-rule-l2) !important;
}

/* The composer's action circle paints its glyph with a **static white literal** —
   the product's own stylesheet says why: white is meant to sit on the blue info
   fill. The skin moves that fill to the accent, so it has to move the glyph with
   it, or the most-clicked control in the interface would sit at 1.50:1.

   The circle is reached through the composer's documented hook, its own accessible
   contract (an icon-only button that opens no popup) and one structural fact — its
   only child is the glyph. No generated class name is involved, and the four other
   glyphs inside that card are excluded by the same two conditions: the file button
   opens a listbox, and the two pickers carry a text label beside their icon. Should
   the product's markup move, this rule stops matching and the glyph goes back to the
   product's own white rather than breaking. */
${skin} [${COMPOSER_ATTRIBUTE}] button:has(> svg:only-child):not([aria-haspopup]) {
  color: var(--dsh-trae-on-accent);
}

/* Both states of a switch are repainted from the skin's own palette: on is the
   accent, off is the faintest hairline. The role and aria-checked attributes are
   the control's own contract — the state it already publishes to assistive
   technology — not a generated class name. */
${skin} [role='switch'][aria-checked='true'] {
  background: var(--dsh-trae-accent) !important;
}

${skin} [role='switch'][aria-checked='false'] {
  background: var(--dsh-trae-rule-l1) !important;
}

/* A 1px neutral ring, offset 2px. Only the geometry is set here: the colour and the
   width travel through the product's own focus tokens above, so a control that
   deliberately paints no ring keeps painting none. The brand colour is reserved for
   state and is never spent on focus. */
${skin} :focus-visible {
  outline-offset: 2px;
}

/* Code takes the mono face, and never a bold one: the reference's 400/500/600 all
   point at a single Regular file, so a heavier mono face does not exist there. */
${skin} code,
${skin} kbd,
${skin} pre,
${skin} samp {
  font-family: var(--dsh-trae-font-mono);
  font-weight: 400;
}

@media (prefers-reduced-motion: reduce) {
  ${skin} [${COMPOSER_ATTRIBUTE}] {
    transition: none;
  }
}
`.trim()
}
