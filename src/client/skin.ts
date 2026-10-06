/**
 * The skin's state on the document body.
 *
 * Two things live there: the custom properties a setting can move, and the five
 * attributes every override in the stylesheet hangs off —
 * `data-dsh-trae`, its scheme, its activity, whether the light breathes, and the
 * band's shape. The shells' own colours are not written here; the stylesheet
 * declares them per scheme, so this half only has to name the scheme that is live.
 *
 * The scheme is a function of the product's own light/dark state only in `auto`.
 * In `auto` the skin therefore watches the attribute the product toggles and
 * repaints when it flips, and the user keeps control of light and dark; in the two
 * explicit schemes the skin moves that attribute instead, because it is the switch
 * the product's own state colours, toasts and diff bands hang off.
 */

import {
  ACTIVITY_ATTRIBUTE,
  PULSE_ATTRIBUTE,
  SCHEME_ATTRIBUTE,
  SKIN_ATTRIBUTE,
  STRIP_ATTRIBUTE,
  THEME_DARK_ATTRIBUTE,
} from '../constants/dom.ts'
import type { Activity } from '../enums/activity.ts'
import type { TraeSkinInput } from '../types/palette.ts'
import { DYNAMIC_VARIABLES, productDarkFor, shellIdFor, shellFor, skinVariables, stripModeFor, type StripMode } from './palette.ts'

/** The document-level half of the skin. */
export interface SkinApplier {
  /** Paint the document with one palette and enable the skin. */
  apply(): void
  /** Report what the product is doing, which the light's breathing follows. */
  setActivity(next: Activity): void
  /** Release the observer and return the document to the application's theme. */
  destroy(): void
}

/**
 * Write one attribute only when it is not already in the state asked for.
 *
 * This is not a micro-optimization. A `MutationObserver` records a write of the
 * value an attribute already holds, so an unconditional re-assert inside the
 * observer's own callback would re-arm the observer on every pass and starve the
 * page's event loop — the document stops responding entirely.
 * @param body - the document body.
 * @param name - attribute to write.
 * @param value - value to write it with.
 */
function setAttribute(body: HTMLElement, name: string, value: string): void {
  if (body.getAttribute(name) === value) return
  body.setAttribute(name, value)
}

/**
 * Put a boolean attribute into the state asked for, writing only on a change.
 * @param body - the document body.
 * @param name - attribute to write.
 * @param wanted - whether it should be present.
 */
function setFlag(body: HTMLElement, name: string, wanted: boolean): void {
  if (body.hasAttribute(name) === wanted) return
  if (wanted) body.setAttribute(name, '')
  else body.removeAttribute(name)
}

/**
 * Create the document-level skin state.
 * @param input - the resolved settings the skin is painted from.
 * @param doc - document whose body carries the skin.
 * @returns the applier owned by the caller's plugin fiber.
 */
export function createSkin(input: TraeSkinInput, doc: Document = document): SkinApplier {
  let observer: MutationObserver | undefined
  let activity: Activity = 'unknown'
  // Whether the product was already in its dark palette before the skin ran, so
  // disposal can put back exactly what it found rather than guessing.
  const productWasDark = doc.body?.hasAttribute(THEME_DARK_ATTRIBUTE) === true

  /** Write the palette and the attributes for the document's current state. */
  function paint(): void {
    const body = doc.body
    if (body === null) return
    const shell = shellFor(shellIdFor(input.scheme, body.hasAttribute(THEME_DARK_ATTRIBUTE)))
    for (const [name, value] of Object.entries(skinVariables(input, shell))) {
      body.style.setProperty(name, value)
    }
    setAttribute(body, SKIN_ATTRIBUTE, '')
    setAttribute(body, SCHEME_ATTRIBUTE, shell.id)
    setAttribute(body, ACTIVITY_ATTRIBUTE, activity)
    setAttribute(body, PULSE_ATTRIBUTE, input.pulse ? 'on' : 'off')
    setAttribute(body, STRIP_ATTRIBUTE, stripModeFor(input))
    syncProductTheme(body)
  }

  /**
   * Keep the product's own light/dark palette in step with the shell.
   *
   * Deliberately a no-op in `auto`: that mode means "follow the product", and
   * writing the attribute it follows would be self-referential. The consequence
   * worth knowing is the other half of the rule — with an explicit scheme the
   * product's own theme toggle no longer decides the shell; this row does.
   * @param body - the document body.
   */
  function syncProductTheme(body: HTMLElement): void {
    const wanted = productDarkFor(input.scheme)
    if (wanted === undefined) return
    setFlag(body, THEME_DARK_ATTRIBUTE, wanted)
  }

  /** Watch the product's theme attribute, but only in the mode that follows it. */
  function watchProductTheme(): void {
    observer?.disconnect()
    observer = undefined
    if (input.scheme !== 'auto' || doc.body === null) return
    observer = new MutationObserver(() => { paint() })
    // Only the product's own theme attribute is watched. The skin's own five
    // attributes are written by the callback above, so observing them would make
    // the observer re-arm itself; this is the one fact that can change without
    // this module asking.
    observer.observe(doc.body, { attributes: true, attributeFilter: [THEME_DARK_ATTRIBUTE] })
  }

  paint()
  watchProductTheme()

  return {
    apply(): void {
      paint()
      watchProductTheme()
    },
    setActivity(next: Activity): void {
      if (next === activity) return
      activity = next
      paint()
    },
    destroy(): void {
      observer?.disconnect()
      observer = undefined
      const body = doc.body
      if (body === null) return
      body.removeAttribute(SKIN_ATTRIBUTE)
      body.removeAttribute(SCHEME_ATTRIBUTE)
      body.removeAttribute(ACTIVITY_ATTRIBUTE)
      body.removeAttribute(PULSE_ATTRIBUTE)
      body.removeAttribute(STRIP_ATTRIBUTE)
      for (const name of DYNAMIC_VARIABLES) body.style.removeProperty(name)
      // Put the product's own flag back the way it was found, and only when the
      // skin was the one that moved it.
      if (productDarkFor(input.scheme) !== undefined) {
        setFlag(body, THEME_DARK_ATTRIBUTE, productWasDark)
      }
    },
  }
}

/** The shape the band is currently asked for, exposed for the caller's own use. */
export type { StripMode }
