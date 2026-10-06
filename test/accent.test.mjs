/**
 * One input, one whole set of safe values.
 *
 * The contract under test is the one the card prints: a user types a **fill**, and
 * every other value — the hover step, the 12% wash, the value used as text, and both
 * four-stop ramps — derives from it. Two of those are measured rather than asserted
 * by eye: the text variant has to clear 4.5:1 against the page it is read on, and the
 * ramp has to keep the reference's own rhythm for an accent the reference never had.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const accent = await loadModule('utils/accent.ts')
const { DARK_SHELL, LIGHT_SHELL, GRADIENT_RHYTHM, GRADIENT_POSITIONS, PLATE_ALPHA, WASH_ALPHA, HOVER_DARKEN } =
  await loadModule('constants/palette.ts')
const { DEFAULT_ACCENT } = await loadModule('constants/plugin.ts')
const { AA_TEXT_CONTRAST, contrast, darken, parseColor, shift, toHex, toHsl, withAlpha } =
  await loadModule('utils/color.ts')

const REFERENCE = '#32f08c'

describe('the default accent', () => {
  it('is the reference site’s own brand colour', () => {
    assert.equal(DEFAULT_ACCENT, REFERENCE)
    assert.equal(accent.DEFAULT_ACCENT, REFERENCE)
  })

  it('is recognised in either case', () => {
    assert.equal(accent.isDefaultAccent('#32f08c'), true)
    assert.equal(accent.isDefaultAccent('  #32F08C '), true)
    assert.equal(accent.isDefaultAccent('#32f08d'), false)
    assert.equal(accent.isDefaultAccent('nonsense'), false)
  })

  it('takes the reference’s own four dark stops, unmodified', () => {
    assert.deepEqual(accent.accentGradient(REFERENCE, DARK_SHELL), DARK_SHELL.gradientStops)
  })

  it('takes the reference’s own four light stops, which are a different four', () => {
    assert.deepEqual(accent.accentGradient(REFERENCE, LIGHT_SHELL), LIGHT_SHELL.gradientStops)
    // The dark ramp's mint end is invisible on a white page, which is why the light
    // shell cannot borrow it.
    assert.notDeepEqual(LIGHT_SHELL.gradientStops, DARK_SHELL.gradientStops)
  })
})

describe('a custom accent', () => {
  it('derives a ramp at the measured rhythm of the shell it is painted in', () => {
    const fill = parseColor('#ff6700')
    for (const shell of [LIGHT_SHELL, DARK_SHELL]) {
      const stops = accent.accentGradient('#ff6700', shell)
      const expected = GRADIENT_RHYTHM[shell.id].map(offset => toHex(shift(fill, offset)))
      assert.deepEqual(stops, expected, `${shell.id} ramp`)
      assert.equal(stops.length, 4)
    }
  })

  it('keeps the accent itself as the second stop', () => {
    const stops = accent.accentGradient('#ff6700', DARK_SHELL)
    assert.equal(stops[1], '#ff6700')
  })

  it('falls back to the reference’s stops for a literal that does not parse', () => {
    assert.deepEqual(accent.accentGradient('not-a-colour', DARK_SHELL), DARK_SHELL.gradientStops)
  })
})

describe('gradientCss', () => {
  it('writes four stops at the reference’s own positions', () => {
    const css = accent.gradientCss(['#3ee1a3', '#32f08c', '#60f2bd', '#a0fde7'])
    assert.equal(css, 'linear-gradient(90deg, #3ee1a3 0, #32f08c 36%, #60f2bd 71.63%, #a0fde7 100%)')
    for (const position of GRADIENT_POSITIONS.slice(1)) {
      assert.ok(css.includes(position), position)
    }
  })

  it('writes the plate as the same ramp at 16% alpha', () => {
    const css = accent.gradientPlateCss(['#3ee1a3', '#32f08c', '#60f2bd', '#a0fde7'])
    assert.equal(PLATE_ALPHA, 0.16)
    assert.ok(css.startsWith('linear-gradient(90deg,'))
    for (const stop of ['#3ee1a3', '#32f08c', '#60f2bd', '#a0fde7']) {
      assert.ok(css.includes(withAlpha(parseColor(stop), PLATE_ALPHA)), stop)
    }
    // The plate must not be the full-strength ramp: painting it solid would hide the
    // gradient the wordmark is clipped out of.
    assert.ok(!css.includes('#32f08c 36%'))
  })
})

describe('accentsFor', () => {
  it('quantizes the fill it was given', () => {
    assert.equal(accent.accentsFor('#32F08C', DARK_SHELL).fill, REFERENCE)
  })

  it('derives the hover step by darkening the fill, not by reading the shell', () => {
    const set = accent.accentsFor('#ff6700', DARK_SHELL)
    assert.equal(set.hover, toHex(darken(parseColor('#ff6700'), HOVER_DARKEN)))
    assert.ok(toHsl(parseColor(set.hover)).l < toHsl(parseColor(set.fill)).l)
    // A hover read off the shell would have stayed the reference's own green.
    assert.notEqual(set.hover, DARK_SHELL.gradientStops[1])
  })

  it('derives the wash at the reference’s own 12%', () => {
    const set = accent.accentsFor('#ff6700', LIGHT_SHELL)
    assert.equal(WASH_ALPHA, 0.12)
    assert.equal(set.wash, withAlpha(parseColor('#ff6700'), WASH_ALPHA))
  })

  it('derives a disabled fill at a third alpha', () => {
    const set = accent.accentsFor('#ff6700', LIGHT_SHELL)
    assert.match(set.disabled, /^#ff6700[0-9a-f]{2}$/u)
  })

  it('leaves the reference’s own accent alone where it can carry text', () => {
    const dark = accent.accentsFor(REFERENCE, DARK_SHELL)
    assert.equal(dark.text, REFERENCE)
    assert.ok(dark.textRatio >= AA_TEXT_CONTRAST)
  })

  it('moves the accent until it can carry text on a white page', () => {
    const light = accent.accentsFor(REFERENCE, LIGHT_SHELL)
    assert.notEqual(light.text, REFERENCE)
    assert.ok(light.textRatio >= AA_TEXT_CONTRAST, `measured ${light.textRatio}`)
  })

  it('measures the ratio it reports', () => {
    for (const [literal, shell] of [[REFERENCE, LIGHT_SHELL], [REFERENCE, DARK_SHELL], ['#ff6700', LIGHT_SHELL]]) {
      const set = accent.accentsFor(literal, shell)
      assert.equal(set.textRatio.toFixed(6), contrast(parseColor(set.text), parseColor(shell.page)).toFixed(6))
    }
  })

  it('clears AA for every accent a user can plausibly type', () => {
    const candidates = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#7f7f7f', '#ff6700', '#32f08c', '#0a0b0d', '#fafafa']
    for (const candidate of candidates) {
      for (const shell of [LIGHT_SHELL, DARK_SHELL]) {
        const set = accent.accentsFor(candidate, shell)
        assert.ok(
          set.textRatio >= AA_TEXT_CONTRAST,
          `${candidate} on ${shell.id} produced ${set.text} at ${set.textRatio.toFixed(2)}:1`,
        )
      }
    }
  })

  it('falls back instead of throwing on a literal that does not parse', () => {
    const set = accent.accentsFor('nonsense', DARK_SHELL)
    assert.equal(set.fill, 'nonsense')
    assert.equal(set.text, 'nonsense')
    assert.deepEqual(set.gradient, DARK_SHELL.gradientStops)
  })
})

describe('textContrast', () => {
  it('re-measures what a derived set reaches', () => {
    const set = accent.accentsFor('#ff6700', LIGHT_SHELL)
    assert.equal(accent.textContrast(set, LIGHT_SHELL).toFixed(6), set.textRatio.toFixed(6))
  })

  it('reports 0 when either literal cannot be read', () => {
    assert.equal(accent.textContrast({ text: 'nonsense' }, LIGHT_SHELL), 0)
  })
})

describe('isAccent', () => {
  it('accepts exactly the literals the colour module accepts', () => {
    assert.equal(accent.isAccent('#32f08c'), true)
    assert.equal(accent.isAccent('#0af'), true)
    assert.equal(accent.isAccent('32f08c'), false)
  })
})
