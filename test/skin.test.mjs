/**
 * The applier: what the skin writes on the document body, and what it hands back.
 *
 * Three contracts are pinned. It writes **five attributes and the half of the palette
 * a setting moves** — the shells' own colours belong to the stylesheet. It moves the
 * product's dark flag for an explicit shell and leaves it alone in `auto`. And it
 * writes only on a change, because an observer whose callback re-asserts its own
 * watched attribute re-arms itself forever.
 */

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { createFakeDocument, withShell } from './fake-dom.mjs'
import { loadModule } from './load-module.mjs'

const { createSkin } = await loadModule('client/skin.ts')
const { skinVariables, DYNAMIC_VARIABLES, stripModeFor } = await loadModule('client/palette.ts')
const { SHELLS } = await loadModule('constants/palette.ts')
const { defaultInput, skinInput } = await import('./input.mjs')

let active

beforeEach(() => { active = undefined })
afterEach(() => { active?.doc.restore() })

/**
 * Build a document with a shell and one skin over it.
 * @param overrides - settings to paint with.
 * @returns the document, the body and the applier.
 */
function mount(overrides = {}) {
  const doc = createFakeDocument()
  active = { doc }
  const body = withShell(doc)
  doc.flush()
  const input = skinInput(overrides)
  const skin = createSkin(input, doc)
  return { doc, body, skin, input }
}

describe('what one paint writes', () => {
  it('marks the document with the skin and the shell that was chosen', () => {
    const { body } = mount({ scheme: 'dark' })
    assert.equal(body.hasAttribute('data-dsh-trae'), true)
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'dark')
  })

  it('carries the band’s shape and the light’s state as their own attributes', () => {
    const { body } = mount({ strip: true, stripBare: true, pulse: false })
    assert.equal(body.getAttribute('data-dsh-trae-strip'), 'bare')
    assert.equal(body.getAttribute('data-dsh-trae-pulse'), 'off')
    assert.equal(body.getAttribute('data-dsh-trae-activity'), 'unknown')
  })

  it('writes the strip’s three shapes from the two switches', () => {
    assert.equal(mount({ strip: false }).body.getAttribute('data-dsh-trae-strip'), 'off')
    assert.equal(mount({ strip: true, stripBare: false }).body.getAttribute('data-dsh-trae-strip'), 'full')
    assert.equal(mount({ strip: true, stripBare: true }).body.getAttribute('data-dsh-trae-strip'), 'bare')
  })

  it('writes exactly the dynamic half of the palette, and nothing else', () => {
    const { body, input } = mount()
    const expected = skinVariables(input, SHELLS.dark)
    for (const [name, value] of Object.entries(expected)) {
      assert.equal(body.style.get(name), value, name)
    }
    // A shell colour is the stylesheet's business: writing it inline would shadow the
    // light block as well as the dark one.
    assert.equal(body.style.get('--dsh-trae-page'), undefined)
    assert.equal(body.style.get('--dsh-trae-ink'), undefined)
  })

  it('derives the glow from the accent by default', () => {
    const { body, input } = mount({ accent: '#32f08c' })
    assert.equal(body.style.get('--dsh-trae-pulse-color'), skinVariables(input, SHELLS.dark)['--dsh-trae-pulse-color'])
    assert.equal(body.style.get('--dsh-trae-pulse-color'), body.style.get('--dsh-trae-accent-text'))
  })

  it('takes a glow colour when one is named', () => {
    const { body } = mount({ pulseColor: '#ff0000' })
    assert.equal(body.style.get('--dsh-trae-pulse-color'), '#ff0000')
  })

  it('neutralizes the glow when the light is off, without touching the accent', () => {
    const { body } = mount({ pulse: false, pulseScale: 2, pulsePeriodMs: 900, pulseOpacity: 0.5 })
    assert.equal(body.style.get('--dsh-trae-pulse-scale'), '1')
    assert.equal(body.style.get('--dsh-trae-pulse-period'), '0ms')
    assert.equal(body.style.get('--dsh-trae-pulse-opacity'), '0')
    assert.equal(body.style.get('--dsh-trae-accent'), '#32f08c')
  })

  it('neutralizes the glow when the band is off, since nothing would show it', () => {
    const { body } = mount({ strip: false, pulse: true })
    assert.equal(body.style.get('--dsh-trae-pulse-opacity'), '0')
    assert.equal(body.getAttribute('data-dsh-trae-pulse'), 'on')
  })
})

describe('the product’s own dark flag', () => {
  it('is forced on by the dark shell', () => {
    const { body } = mount({ scheme: 'dark' })
    assert.equal(body.hasAttribute('data-ds-dark-theme'), true)
  })

  it('is forced off by the light shell', () => {
    const doc = createFakeDocument()
    active = { doc }
    const body = withShell(doc)
    body.setAttribute('data-ds-dark-theme', '')
    doc.flush()
    createSkin(skinInput({ scheme: 'light' }), doc)
    assert.equal(body.hasAttribute('data-ds-dark-theme'), false)
  })

  it('is left exactly as it was found in auto', () => {
    const doc = createFakeDocument()
    active = { doc }
    const body = withShell(doc)
    body.setAttribute('data-ds-dark-theme', '')
    doc.flush()
    const skin = createSkin(skinInput({ scheme: 'auto' }), doc)
    assert.equal(body.hasAttribute('data-ds-dark-theme'), true)
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'dark')
    skin.destroy()
    assert.equal(body.hasAttribute('data-ds-dark-theme'), true)
  })

  it('follows the product in auto, and repaints when it flips', () => {
    const doc = createFakeDocument()
    active = { doc }
    const body = withShell(doc)
    doc.flush()
    createSkin(skinInput({ scheme: 'auto' }), doc)
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'light')
    // On the white page the accent has to move before it can carry text.
    const onLight = body.style.get('--dsh-trae-accent-text')
    assert.notEqual(onLight, '#32f08c')
    body.setAttribute('data-ds-dark-theme', '')
    doc.flush()
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'dark')
    // On the near-black page the reference's own accent already clears AA, so the
    // text variant is the accent itself again.
    assert.equal(body.style.get('--dsh-trae-accent-text'), '#32f08c')
    body.removeAttribute('data-ds-dark-theme')
    doc.flush()
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'light')
    assert.equal(body.style.get('--dsh-trae-accent-text'), onLight)
  })

  it('is watched only in auto, and only for that one attribute', () => {
    const followed = createFakeDocument()
    active = { doc: followed }
    withShell(followed)
    followed.flush()
    createSkin(skinInput({ scheme: 'auto' }), followed)
    assert.equal(followed.observers.length, 1)
    assert.deepEqual(followed.observers[0].attributeFilter, ['data-ds-dark-theme'])
    assert.equal(followed.observers[0].subtree ?? false, false)

    const pinned = createFakeDocument()
    active = { doc: pinned }
    withShell(pinned)
    pinned.flush()
    createSkin(skinInput({ scheme: 'dark' }), pinned)
    assert.equal(pinned.observers.length, 0)
  })

  it('does not re-arm its own observer, because it writes only on a change', () => {
    const doc = createFakeDocument()
    active = { doc }
    withShell(doc)
    doc.flush()
    createSkin(skinInput({ scheme: 'auto' }), doc)
    doc.recording = false
    doc.body.setAttribute('data-ds-dark-theme', '')
    doc.body.setAttribute('data-ds-dark-theme', '')
    doc.recording = true
    // Both writes are recorded, as a browser would; the applier must survive them
    // without writing its own attributes back in a loop.
    doc.flush()
    assert.ok(doc.callbacks < 5, `observer ran ${doc.callbacks} passes`)
  })
})

describe('setActivity', () => {
  it('writes the activity the band breathes on', () => {
    const { body, skin } = mount()
    skin.setActivity('running')
    assert.equal(body.getAttribute('data-dsh-trae-activity'), 'running')
    skin.setActivity('idle')
    assert.equal(body.getAttribute('data-dsh-trae-activity'), 'idle')
  })

  it('notices nothing when the reading has not moved', () => {
    const { doc, skin } = mount()
    skin.setActivity('running')
    doc.flush()
    const before = doc.callbacks
    skin.setActivity('running')
    assert.equal(doc.callbacks, before)
  })

  it('repaints the palette with the reading, so a shell change lands with it', () => {
    const { body, skin, input } = mount()
    input.accent = '#ff6700'
    skin.setActivity('running')
    assert.equal(body.style.get('--dsh-trae-accent'), skinVariables(input, SHELLS.dark)['--dsh-trae-accent'])
  })
})

describe('apply', () => {
  it('repaints after the input has been changed in place', () => {
    const { body, skin, input } = mount({ accent: '#32f08c' })
    input.accent = '#ff6700'
    input.scheme = 'light'
    skin.apply()
    assert.equal(body.style.get('--dsh-trae-accent'), '#ff6700')
    assert.equal(body.getAttribute('data-dsh-trae-scheme'), 'light')
    assert.equal(body.hasAttribute('data-ds-dark-theme'), false)
  })

  it('re-arms the theme observer only for the mode that follows it', () => {
    const { doc, skin, input } = mount({ scheme: 'auto' })
    assert.equal(doc.observers.length, 1)
    input.scheme = 'dark'
    skin.apply()
    assert.equal(doc.observers.length, 0)
    input.scheme = 'auto'
    skin.apply()
    assert.equal(doc.observers.length, 1)
  })
})

describe('destroy', () => {
  it('hands the document back with every attribute and variable removed', () => {
    const { body, skin } = mount()
    skin.destroy()
    for (const name of ['data-dsh-trae', 'data-dsh-trae-scheme', 'data-dsh-trae-activity', 'data-dsh-trae-pulse', 'data-dsh-trae-strip']) {
      assert.equal(body.hasAttribute(name), false, name)
    }
    for (const name of DYNAMIC_VARIABLES) {
      assert.equal(body.style.get(name), undefined, name)
    }
    assert.ok(body.style.removals.length >= DYNAMIC_VARIABLES.length)
  })

  it('puts the product’s own theme flag back the way it found it', () => {
    const doc = createFakeDocument()
    active = { doc }
    const body = withShell(doc)
    body.setAttribute('data-ds-dark-theme', '')
    doc.flush()
    const skin = createSkin(skinInput({ scheme: 'light' }), doc)
    assert.equal(body.hasAttribute('data-ds-dark-theme'), false)
    skin.destroy()
    assert.equal(body.hasAttribute('data-ds-dark-theme'), true)
  })

  it('leaves that flag alone when the mode never touched it', () => {
    const doc = createFakeDocument()
    active = { doc }
    const body = withShell(doc)
    doc.flush()
    const skin = createSkin(skinInput({ scheme: 'auto' }), doc)
    skin.destroy()
    assert.equal(body.hasAttribute('data-ds-dark-theme'), false)
  })

  it('releases its observer', () => {
    const { doc, skin } = mount({ scheme: 'auto' })
    assert.equal(doc.observers.length, 1)
    skin.destroy()
    assert.equal(doc.observers.length, 0)
  })

  it('survives a document with no body', () => {
    const doc = createFakeDocument()
    active = { doc }
    doc.body.remove()
    assert.doesNotThrow(() => {
      const skin = createSkin(defaultInput(), doc)
      skin.setActivity('running')
      skin.destroy()
    })
  })
})

describe('the band’s shape helpers', () => {
  it('agree with what the applier writes', () => {
    for (const strip of [true, false]) {
      for (const stripBare of [true, false]) {
        const input = skinInput({ strip, stripBare })
        const { body } = mount({ strip, stripBare })
        assert.equal(body.getAttribute('data-dsh-trae-strip'), stripModeFor(input))
      }
    }
  })
})
