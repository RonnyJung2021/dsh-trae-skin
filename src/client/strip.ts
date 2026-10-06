/**
 * The status band pinned across the top of the page.
 *
 * Three things in one row, in this order: the indicator light, the gradient
 * wordmark on its own 16% plate, and the state in words for assistive technology.
 * The reference's own header is a flat row with one hairline under it, so that is
 * what this is — not a toolbar. Nothing on the band is clickable, which is why it
 * never competes with the conversation for attention.
 *
 * The node is a child of `body`, beside `#root`: React never reconciles body's
 * extra children, so nothing the page renders can take the band away. It declares
 * the product's own `data-window-drag`, because the shell's rule subtracts every
 * direct child of body from the window's drag region and the band now owns the top
 * of the window.
 */

import {
  LAMP_CLASS,
  MARK_CLASS,
  PLATE_CLASS,
  STATE_CLASS,
  STRIP_CLASS,
  WINDOW_DRAG_ATTRIBUTE,
} from '../constants/dom.ts'
import type { Activity } from '../enums/activity.ts'
import type { StripCopy } from './copy.ts'

/** One mounted band. */
export interface StatusBand {
  /** Replace the wordmark without rebuilding the band. */
  setWordmark(text: string): void
  /** Report what the product is doing; the light and the state text follow it. */
  setActivity(activity: Activity): void
  /** Remove every node this band owns. */
  destroy(): void
}

/**
 * Mount the status band.
 * @param doc - document owning the page.
 * @param copy - the two words the live region speaks.
 * @returns the band handle owned by the caller's plugin fiber.
 */
export function createStatusBand(doc: Document = document, copy: StripCopy = { idle: '', busy: '' }): StatusBand {
  const element = doc.createElement('div')
  element.className = STRIP_CLASS
  // The band is one live region: what changes in it is the state, and a screen
  // reader is owed that change without being handed the wordmark again.
  element.setAttribute('role', 'status')
  element.setAttribute(WINDOW_DRAG_ATTRIBUTE, '')

  const lamp = doc.createElement('span')
  lamp.className = LAMP_CLASS
  // The light is the same state the text below spells out, so it is decoration.
  lamp.setAttribute('aria-hidden', 'true')

  const plate = doc.createElement('span')
  plate.className = PLATE_CLASS
  const mark = doc.createElement('span')
  mark.className = MARK_CLASS
  plate.append(mark)

  const state = doc.createElement('span')
  state.className = STATE_CLASS

  // The reference puts its mark's lamp to the left of the wordmark, so the light
  // leads.
  element.append(lamp, plate, state)

  const mount = doc.body
  mount?.append(element)

  /** Write the state both ways: the attribute the light reads, and the words. */
  function report(activity: Activity): void {
    state.textContent = activity === 'idle' ? copy.idle : copy.busy
  }
  report('unknown')

  return {
    setWordmark(text: string): void {
      mark.textContent = text
    },
    setActivity(activity: Activity): void {
      report(activity)
    },
    destroy(): void {
      element.remove()
    },
  }
}
