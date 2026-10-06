/**
 * The status band's markup.
 *
 * The band is a read-only display, so most of what matters here is what it *is*: the
 * order of its three parts (the reference puts the light to the left of the mark), the
 * live region it declares, the product's own drag hook, and the fact that nothing on
 * it is focusable or clickable.
 */

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { createFakeDocument, withShell } from './fake-dom.mjs'
import { loadModule } from './load-module.mjs'

const { createStatusBand } = await loadModule('client/strip.ts')
const dom = await loadModule('constants/dom.ts')
const { stripCopy } = await loadModule('client/copy.ts')

let active

beforeEach(() => { active = undefined })
afterEach(() => { active?.doc.restore() })

/**
 * Mount a band on a document with a shell in it.
 * @returns the document, the body and the band.
 */
function mount() {
  const doc = createFakeDocument()
  active = { doc }
  const body = withShell(doc)
  doc.flush()
  const band = createStatusBand(doc, { idle: '空闲', busy: '进行中' })
  return { doc, body, band }
}

describe('the band’s elements', () => {
  it('is one status region, with no live-region attribute duplicated', () => {
    const { doc } = mount()
    const strip = doc.querySelector(`.${dom.STRIP_CLASS}`)
    assert.equal(strip.getAttribute('role'), 'status')
    // `role="status"` already implies a polite live region; declaring it twice would
    // be two sources of truth for one behaviour.
    assert.equal(strip.hasAttribute('aria-live'), false)
  })

  it('puts the light to the left of the wordmark, as the reference does', () => {
    const { doc } = mount()
    const strip = doc.querySelector(`.${dom.STRIP_CLASS}`)
    const classes = strip.children.map(child => child.getAttribute('class'))
    assert.deepEqual(classes, [dom.LAMP_CLASS, dom.PLATE_CLASS, dom.STATE_CLASS])
  })

  it('keeps the wordmark on its own plate', () => {
    const { doc } = mount()
    const plate = doc.querySelector(`.${dom.PLATE_CLASS}`)
    assert.deepEqual(plate.children.map(child => child.getAttribute('class')), [dom.MARK_CLASS])
  })

  it('declares the product’s own window-drag hook', () => {
    const { doc } = mount()
    assert.equal(doc.querySelector(`.${dom.STRIP_CLASS}`).hasAttribute(dom.WINDOW_DRAG_ATTRIBUTE), true)
  })

  it('hides the light from assistive technology, because the state is also in words', () => {
    const { doc } = mount()
    const lamp = doc.querySelector(`.${dom.LAMP_CLASS}`)
    assert.equal(lamp.getAttribute('aria-hidden'), 'true')
    assert.equal(lamp.textContent, '')
  })

  it('carries nothing focusable or clickable', () => {
    const { doc } = mount()
    const strip = doc.querySelector(`.${dom.STRIP_CLASS}`)
    for (const tag of ['button', 'a', 'input', 'select', 'textarea']) {
      assert.equal(strip.querySelector(tag), null, tag)
    }
    assert.equal(strip.hasAttribute('tabindex'), false)
  })

  it('is mounted beside the app root, where React never reconciles', () => {
    const { doc, body } = mount()
    const strip = doc.querySelector(`.${dom.STRIP_CLASS}`)
    assert.equal(strip.parentElement, body)
    assert.equal(doc.getElementById('root').children.length, 0)
  })
})

describe('the band’s state', () => {
  it('starts on the unknown reading, which is what a fresh page has', () => {
    const { doc } = mount()
    // No call to `setActivity` yet: the light is unknown, so it breathes, and the
    // words say the busy half rather than claiming the product is idle.
    assert.equal(doc.querySelector(`.${dom.STATE_CLASS}`).textContent, '进行中')
  })

  it('says idle when the product is idle, and busy while it works', () => {
    const { doc, band } = mount()
    band.setActivity('idle')
    assert.equal(doc.querySelector(`.${dom.STATE_CLASS}`).textContent, '空闲')
    band.setActivity('running')
    assert.equal(doc.querySelector(`.${dom.STATE_CLASS}`).textContent, '进行中')
    band.setActivity('unknown')
    assert.equal(doc.querySelector(`.${dom.STATE_CLASS}`).textContent, '进行中')
  })

  it('replaces the wordmark without rebuilding the band', () => {
    const { doc, band } = mount()
    const strip = doc.querySelector(`.${dom.STRIP_CLASS}`)
    band.setWordmark('DEEPSEEK HARNESS')
    assert.equal(doc.querySelector(`.${dom.MARK_CLASS}`).textContent, 'DEEPSEEK HARNESS')
    band.setWordmark('HELLO')
    assert.equal(doc.querySelector(`.${dom.MARK_CLASS}`).textContent, 'HELLO')
    assert.equal(doc.querySelector(`.${dom.STRIP_CLASS}`), strip)
  })

  it('starts with an empty wordmark, which the caller fills in from the settings', () => {
    const { doc } = mount()
    assert.equal(doc.querySelector(`.${dom.MARK_CLASS}`).textContent, '')
  })
})

describe('destroy', () => {
  it('takes the band out of the document and leaves the shell alone', () => {
    const { doc, band } = mount()
    const root = doc.getElementById('root')
    band.destroy()
    assert.equal(doc.querySelector(`.${dom.STRIP_CLASS}`), null)
    assert.equal(doc.getElementById('root'), root)
  })

  it('is safe to call twice', () => {
    const { band } = mount()
    band.destroy()
    assert.doesNotThrow(() => { band.destroy() })
  })
})

describe('the two words', () => {
  it('come from the dictionaries, in both languages', () => {
    assert.deepEqual(stripCopy('zh-CN'), { idle: '空闲', busy: '进行中' })
    assert.deepEqual(stripCopy('en-US'), { idle: 'Idle', busy: 'Working' })
  })

  it('fall back to English for a language neither dictionary covers', () => {
    assert.deepEqual(stripCopy('fr-FR'), stripCopy('en'))
  })
})
