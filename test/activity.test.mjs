/**
 * The reading of the product's streaming signal.
 *
 * Three behaviours are pinned here, and each one exists because the obvious
 * implementation gets it wrong:
 *
 * - a product that never publishes `data-streaming` must read as **unknown**, not as
 *   idle, or the light sits still on a build that simply does not report;
 * - a node that **arrives already carrying** the attribute produces no attribute
 *   mutation, so the child-list branch has to notice it;
 * - the callback fires on a **change**, not on every mutation, so a turn costs two
 *   calls however much the product renders in between.
 */

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { createFakeDocument } from './fake-dom.mjs'
import { loadModule } from './load-module.mjs'

const { readActivity, observeActivity, shouldBreathe } = await loadModule('client/activity.ts')

/** A document with one node the product can mark, as its own markup does. */
function pageWithSignal() {
  const doc = createFakeDocument()
  const node = doc.createElement('div')
  doc.body.appendChild(node)
  doc.flush()
  return { doc, node }
}

let active

beforeEach(() => { active = undefined })
afterEach(() => { active?.doc.restore() })

describe('readActivity', () => {
  it('reports unknown when nothing carries the attribute at all', () => {
    const doc = createFakeDocument()
    active = { doc }
    assert.deepEqual(readActivity(doc), { activity: 'idle', known: false })
  })

  it('reports idle when the attribute is present but not the running value', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    node.setAttribute('data-streaming', 'false')
    assert.deepEqual(readActivity(doc), { activity: 'idle', known: true })
  })

  it('reports running when the attribute says so', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    node.setAttribute('data-streaming', 'true')
    assert.deepEqual(readActivity(doc), { activity: 'running', known: true })
  })

  it('finds the signal on a descendant, not only on the node it is handed', () => {
    const doc = createFakeDocument()
    active = { doc }
    const outer = doc.createElement('div')
    const inner = doc.createElement('span')
    outer.appendChild(inner)
    doc.body.appendChild(outer)
    inner.setAttribute('data-streaming', 'true')
    assert.equal(readActivity(doc).activity, 'running')
  })

  it('takes one running node as the answer, even beside idle ones', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    node.setAttribute('data-streaming', 'false')
    const other = doc.createElement('span')
    doc.body.appendChild(other)
    other.setAttribute('data-streaming', 'true')
    assert.equal(readActivity(doc).activity, 'running')
  })
})

describe('observeActivity', () => {
  it('reports unknown on a product that publishes no signal', () => {
    const doc = createFakeDocument()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    assert.deepEqual(seen, ['unknown'])
  })

  it('reports unknown again when only unrelated nodes are added', () => {
    const doc = createFakeDocument()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    doc.body.appendChild(doc.createElement('div'))
    doc.flush()
    assert.deepEqual(seen, ['unknown'])
  })

  it('follows the attribute being set and cleared, once each', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    node.setAttribute('data-streaming', 'true')
    doc.flush()
    node.removeAttribute('data-streaming')
    doc.flush()
    assert.deepEqual(seen, ['unknown', 'running', 'idle'])
  })

  it('reports nothing while the reading stays where it was', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    node.setAttribute('data-streaming', 'true')
    doc.flush()
    // Every token the product renders is another mutation; none of them is a new
    // reading, and the light must not be repainted for them.
    for (let pass = 0; pass < 5; pass += 1) {
      const text = doc.createElement('span')
      node.appendChild(text)
      doc.flush()
    }
    assert.deepEqual(seen, ['unknown', 'running'])
  })

  it('catches a node that arrives already carrying the attribute', () => {
    const doc = createFakeDocument()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    const fresh = doc.createElement('div')
    // Set before insertion, which is exactly what React does when a message mounts
    // while the turn is already running: no attribute mutation is ever recorded.
    fresh.setAttribute('data-streaming', 'true')
    doc.body.appendChild(fresh)
    doc.flush()
    assert.deepEqual(seen, ['unknown', 'running'])
  })

  it('stops reporting unknown once the product has been heard from', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    const seen = []
    observeActivity(next => seen.push(next), doc)
    node.setAttribute('data-streaming', 'true')
    doc.flush()
    node.removeAttribute('data-streaming')
    doc.flush()
    node.remove() // the message unmounts, taking the attribute with it
    doc.flush()
    // Silence after the signal has been seen means idle, not "unknown".
    assert.deepEqual(seen, ['unknown', 'running', 'idle'])
  })

  it('reads the document as it stands when it starts', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    node.setAttribute('data-streaming', 'true')
    const seen = []
    observeActivity(next => seen.push(next), doc)
    assert.deepEqual(seen, ['running'])
  })

  it('watches the one attribute, across the whole document', () => {
    const { doc } = pageWithSignal()
    active = { doc }
    observeActivity(() => {}, doc)
    assert.equal(doc.observers.length, 1)
    const [observer] = doc.observers
    assert.equal(observer.attributes, true)
    assert.deepEqual(observer.attributeFilter, ['data-streaming'])
    assert.equal(observer.subtree, true)
    assert.equal(observer.target, doc.documentElement)
  })

  it('delivers nothing once it is destroyed', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    const seen = []
    const observer = observeActivity(next => seen.push(next), doc)
    observer.destroy()
    node.setAttribute('data-streaming', 'true')
    doc.flush()
    assert.deepEqual(seen, ['unknown'])
  })

  it('can be asked for a fresh reading without waiting for a mutation', () => {
    const { doc, node } = pageWithSignal()
    active = { doc }
    const seen = []
    const observer = observeActivity(next => seen.push(next), doc)
    // A write made while recording is off is invisible to the observer, which is what
    // a change made during teardown looks like.
    doc.recording = false
    node.setAttribute('data-streaming', 'true')
    doc.recording = true
    observer.refresh()
    assert.deepEqual(seen, ['unknown', 'running'])
  })
})

describe('shouldBreathe', () => {
  it('breathes while a turn runs', () => {
    assert.equal(shouldBreathe('running'), true)
  })

  it('breathes on an unknown reading, because a motionless dot reads as broken', () => {
    assert.equal(shouldBreathe('unknown'), true)
  })

  it('does not breathe when the product has said it is idle', () => {
    assert.equal(shouldBreathe('idle'), false)
  })
})
