/**
 * The product's own streaming signal, as the breathing light reads it.
 *
 * DSH reports its work by putting `data-streaming` on the node it is producing —
 * absent when nothing runs, `"true"` while it does. That is the whole contract,
 * and it is a good one for a skin: the attribute changes **twice per turn**, so
 * following it costs a mutation callback per turn instead of one per token.
 *
 * Two consequences are handled here rather than at the call site:
 *
 * - **A product that never publishes the attribute.** Reading the absence of
 *   `data-streaming` as "idle" would leave the light permanently still on a build
 *   that simply does not report. Until the signal has been seen once, the reading
 *   is `unknown`, and the band breathes on that reading the same way it breathes
 *   while a turn runs.
 * - **A node that arrives already carrying it.** An element inserted with the
 *   attribute set produces no attribute mutation, so the observer also looks at
 *   what was *added* — a plain `hasAttribute` check per added element, never a
 *   subtree query, so a token-by-token re-render costs one boolean each.
 */

import { STREAMING_ATTRIBUTE } from '../constants/dom.ts'
import type { Activity } from '../enums/activity.ts'

/** The attribute in the state that means "working". */
const RUNNING = 'true'

/** One reading of the signal: what the product is doing, and whether it said so. */
export interface ActivityReading {
  /** `running` while a turn is being produced, `idle` when one is not. */
  readonly activity: Activity
  /** Whether the product publishes the signal at all. */
  readonly known: boolean
}

/** A live subscription to the product's streaming signal. */
export interface ActivityObserver {
  /** Re-read the signal now, without waiting for a mutation. */
  refresh(): void
  /** Stop watching and drop every reference this observer held. */
  destroy(): void
}

/**
 * Read the streaming signal once.
 *
 * `known` is false only when nothing in the document carries the attribute at
 * all, which is the state a product that does not publish it stays in; a document
 * whose nodes carry it in the `false` state is known and idle.
 * @param root - subtree to read; the whole document by default.
 * @returns the reading.
 */
export function readActivity(root: ParentNode = document): ActivityReading {
  const marked = root.querySelectorAll(`[${STREAMING_ATTRIBUTE}]`)
  if (marked.length === 0) return { activity: 'idle', known: false }
  for (const element of marked) {
    if (element.getAttribute(STREAMING_ATTRIBUTE) === RUNNING) return { activity: 'running', known: true }
  }
  return { activity: 'idle', known: true }
}

/**
 * Whether the light should be breathing on this reading.
 *
 * An unknown reading breathes: a motionless dot reads as "not working", and the
 * skin would rather pulse on a product it cannot hear than sit still on one that
 * is busy.
 * @param activity - one reading.
 * @returns true while a turn runs, and while the signal is unreadable.
 */
export function shouldBreathe(activity: Activity): boolean {
  return activity !== 'idle'
}

/**
 * Watch the product's streaming signal.
 *
 * The callback fires only when the **reading changes**, so a turn produces two
 * calls — one at its start and one at its end — however much the product renders
 * in between.
 * @param onChange - called with each new reading.
 * @param root - document to watch; the page by default.
 * @returns the observer owned by the caller's plugin fiber.
 */
export function observeActivity(
  onChange: (activity: Activity) => void,
  root: Document = document,
): ActivityObserver {
  let known = false
  let current: Activity | undefined

  /** Re-read and report, if the reading moved. */
  function sync(): void {
    const reading = readActivity(root)
    if (reading.known) known = true
    // Once the product has been heard from, silence means idle rather than
    // "unknown": the signal is published, there is just nothing running.
    const next: Activity = known ? reading.activity : 'unknown'
    if (next === current) return
    current = next
    onChange(next)
  }

  const scope = root.documentElement
  const observer = new MutationObserver((records) => {
    const relevant = records.some(record => record.type === 'attributes'
      || [...record.addedNodes].some(node => node.nodeType === 1
        && (node as Element).hasAttribute(STREAMING_ATTRIBUTE)))
    if (relevant) sync()
  })
  if (scope !== null) {
    observer.observe(scope, {
      attributes: true,
      attributeFilter: [STREAMING_ATTRIBUTE],
      childList: true,
      subtree: true,
    })
  }
  sync()

  return {
    refresh: sync,
    destroy(): void {
      observer.disconnect()
      current = undefined
      known = false
    },
  }
}
