/**
 * The contrast guarantees, measured rather than asserted by eye.
 *
 * A skin can look right and still be unreadable, so the two things a skin decides
 * about legibility are pinned here: every text token the skin repoints is measured
 * against the page it lands on, and the one badge the product paints with **two**
 * tokens of its own — the version badge in the sidebar, filled with the primary label
 * and lettered with the inverted one — is checked in both shells.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const { DARK_SHELL, LIGHT_SHELL, SHELLS } = await loadModule('constants/palette.ts')
const { accentsFor } = await loadModule('utils/accent.ts')
const { AA_TEXT_CONTRAST, contrast, parseColor, toHsl } = await loadModule('utils/color.ts')

/** The product's own inverted-label value per theme, which the skin never writes. */
const INVERTED_LABEL = {
  // `--dsw-static-neutral-bluish-00`, the light theme's value.
  light: '#ffffff',
  // `--dsw-static-neutral-bluish-800`, the dark theme's value.
  dark: '#36393d',
}

describe('the ink ramps', () => {
  it('clears AA on its own page, in both shells', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const page = parseColor(shell.page)
      for (const field of ['ink', 'muted', 'faint']) {
        const ratio = contrast(parseColor(shell[field]), page)
        assert.ok(ratio >= AA_TEXT_CONTRAST, `${shell.id}.${field} is ${ratio.toFixed(2)}:1`)
      }
    }
  })

  it('keeps the three steps apart, so secondary and tertiary text stay distinguishable', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const page = parseColor(shell.page)
      const ratios = ['ink', 'muted', 'faint'].map(field => contrast(parseColor(shell[field]), page))
      assert.deepEqual(ratios, [...ratios].sort((a, b) => b - a), shell.id)
      assert.ok(ratios[0] - ratios[2] > 1, shell.id)
    }
  })

  it('keeps the light shell’s corrected tertiary step above the floor it was corrected for', () => {
    // The reference's own `#8a9096` is 3.23:1 on white; the skin's is 4.66:1.
    const reference = contrast(parseColor('#8a9096'), parseColor('#ffffff'))
    const corrected = contrast(parseColor(LIGHT_SHELL.faint), parseColor('#ffffff'))
    assert.ok(reference < AA_TEXT_CONTRAST)
    assert.ok(corrected >= AA_TEXT_CONTRAST)
  })
})

describe('the sidebar’s version badge', () => {
  it('never becomes dark on dark, in either shell', () => {
    // The badge is `background: var(--dsw-alias-label-primary)` with
    // `color: var(--dsw-alias-label-primary-inverted)`. The skin repoints the first at
    // its own ink and deliberately leaves the second alone, so the pair has to be
    // measured on the values that actually meet.
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const fill = parseColor(shell.ink)
      const label = parseColor(INVERTED_LABEL[shell.id])
      const ratio = contrast(fill, label)
      assert.ok(ratio >= AA_TEXT_CONTRAST, `${shell.id} badge is ${ratio.toFixed(2)}:1`)
    }
  })

  it('reads as the reference’s own badge in the light shell: near-black fill, white label', () => {
    const fill = parseColor(LIGHT_SHELL.ink)
    const label = parseColor(INVERTED_LABEL.light)
    assert.ok(contrast(fill, parseColor('#000000')) < 1.3, 'the fill should be near-black')
    assert.equal(contrast(label, parseColor('#ffffff')).toFixed(2), '1.00')
  })

  it('inverts in the dark shell rather than disappearing', () => {
    const ratio = contrast(parseColor(DARK_SHELL.ink), parseColor(INVERTED_LABEL.dark))
    assert.ok(ratio > 7, `expected AAA, measured ${ratio.toFixed(2)}:1`)
  })
})

describe('the accent as a label on the primary button', () => {
  it('clears AA for the reference’s own accent, in both shells', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const set = accentsFor('#32f08c', shell)
      const ratio = contrast(parseColor(set.fill), parseColor(shell.onAccent))
      assert.ok(ratio >= AA_TEXT_CONTRAST, `${shell.id} primary label is ${ratio.toFixed(2)}:1`)
    }
  })

  it('is reported honestly for an accent that cannot carry one, rather than hidden', () => {
    // A user is free to pick a fill with no contrast against the on-brand label; the
    // skin does not silently repaint it, and the card prints what it measures.
    const set = accentsFor('#101010', LIGHT_SHELL)
    const ratio = contrast(parseColor(set.fill), parseColor(LIGHT_SHELL.onAccent))
    assert.ok(ratio < AA_TEXT_CONTRAST)
  })
})

describe('the two ramps', () => {
  it('keeps every stop of the reference’s own dark ramp readable on the near-black page', () => {
    for (const stop of DARK_SHELL.gradientStops) {
      const ratio = contrast(parseColor(stop), parseColor(DARK_SHELL.page))
      assert.ok(ratio >= AA_TEXT_CONTRAST, `${stop} is ${ratio.toFixed(2)}:1`)
    }
  })

  it('keeps every stop of the light ramp readable on white, which is why it is a second ramp', () => {
    // The wordmark is rendered as text, so every stop of the ramp it is clipped out of
    // has to be readable on the page behind it. The reference's own light block is not:
    // its four stops measure 2.07–2.36:1 on white, which is why the skin keeps their
    // hues and corrects their lightness — the same treatment the light shell gives its
    // tertiary text and its brand fill.
    for (const stop of LIGHT_SHELL.gradientStops) {
      const ratio = contrast(parseColor(stop), parseColor(LIGHT_SHELL.page))
      assert.ok(ratio >= AA_TEXT_CONTRAST, `${stop} is ${ratio.toFixed(2)}:1`)
    }
  })

  it('keeps the reference’s own hues while it corrects their lightness', () => {
    const reference = ['#0ac27b', '#0ecd70', '#06c179', '#63c5b1']
    const hues = reference.map(stop => Math.round(toHsl(parseColor(stop)).h))
    const corrected = LIGHT_SHELL.gradientStops.map(stop => Math.round(toHsl(parseColor(stop)).h))
    assert.deepEqual(corrected, hues)
    for (const [index, stop] of LIGHT_SHELL.gradientStops.entries()) {
      assert.ok(toHsl(parseColor(stop)).l < toHsl(parseColor(reference[index])).l, stop)
    }
  })

  it('keeps the four stops distinguishable, not collapsed onto one value', () => {
    const lightness = LIGHT_SHELL.gradientStops.map(stop => toHsl(parseColor(stop)).l)
    assert.ok(Math.max(...lightness) - Math.min(...lightness) >= 8, lightness.join(', '))
  })

  it('shows why the dark ramp cannot be reused on the light page', () => {
    const unreadable = DARK_SHELL.gradientStops
      .filter(stop => contrast(parseColor(stop), parseColor(LIGHT_SHELL.page)) < AA_TEXT_CONTRAST)
    assert.equal(unreadable.length, 4, 'all four dark stops should fail on white')
  })
})

describe('the shells themselves', () => {
  it('separate the page from the surface nested in it, without a shadow', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const page = parseColor(shell.page)
      const raised = parseColor(shell.raised)
      assert.notEqual(shell.raised, shell.page, shell.id)
      // The reference's flat depth: a nested fill one step off the page, so a card
      // reads as a card even where a shadow is invisible.
      assert.ok(contrast(page, raised) >= 1.04, `${shell.id} nested fill is invisible`)
    }
  })

  it('has two distinguishable scrollbar thumbs, and never a weaker hover step', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const resting = Number.parseInt(shell.scrollThumb.slice(7), 16)
      const hover = Number.parseInt(shell.scrollThumbHover.slice(7), 16)
      assert.ok(resting > 0, `${shell.id}: the resting thumb is invisible`)
      assert.notEqual(shell.scrollThumb, shell.scrollThumbHover, `${shell.id}: one thumb, not two`)
      assert.ok(hover >= resting, `${shell.id}: hovering must not fade the thumb`)
    }
  })

  it('lists only the two shells the applier can name', () => {
    assert.deepEqual(Object.keys(SHELLS).sort(), ['dark', 'light'])
  })
})
