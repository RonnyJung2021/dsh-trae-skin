/**
 * The colour arithmetic the derivation rests on.
 *
 * Two things here are not obvious and are pinned deliberately: the contrast ramp is
 * measured on the **quantized** value, because rounding alone can pull 4.50 down to
 * 4.48; and a colour that already clears the floor comes back untouched, so the
 * reference's own accent survives wherever it can.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const {
  AA_TEXT_CONTRAST, contrast, darken, formatRatio, fromHsl, isColor, lighten, luminance, mix,
  parseColor, quantize, readableOn, shift, toHex, toHsl, withAlpha,
} = await loadModule('utils/color.ts')

/** The reference's near-black page and its white counterpart. */
const DARK_PAGE = parseColor('#0a0b0d')
const LIGHT_PAGE = parseColor('#ffffff')

describe('parseColor', () => {
  it('reads the six-digit form', () => {
    assert.deepEqual(parseColor('#32f08c'), { r: 0x32, g: 0xf0, b: 0x8c })
  })

  it('expands the three-digit form', () => {
    assert.deepEqual(parseColor('#0af'), parseColor('#00aaff'))
  })

  it('accepts upper case and surrounding space', () => {
    assert.deepEqual(parseColor('  #32F08C '), { r: 0x32, g: 0xf0, b: 0x8c })
  })

  it('refuses everything else', () => {
    for (const value of ['32f08c', '#12345', '#1234567', 'rgb(1,2,3)', '', undefined, 42, null]) {
      assert.equal(parseColor(value), undefined, `expected ${String(value)} to be refused`)
    }
  })

  it('answers isColor the same way', () => {
    assert.equal(isColor('#32f08c'), true)
    assert.equal(isColor('#xyz'), false)
  })
})

describe('toHex and quantize', () => {
  it('writes lower-case six-digit literals, rounded and padded', () => {
    assert.equal(toHex({ r: 50, g: 240, b: 140 }), '#32f08c')
    assert.equal(toHex({ r: 0, g: 0, b: 0 }), '#000000')
    assert.equal(toHex({ r: 1, g: 2, b: 3 }), '#010203')
    assert.equal(toHex({ r: 300, g: -20, b: 127.6 }), '#ff0080')
  })

  it('round-trips a colour back to the bytes its literal carries', () => {
    const quantized = quantize({ r: 50.4, g: 240.6, b: 139.5 })
    assert.deepEqual(quantized, parseColor(toHex({ r: 50.4, g: 240.6, b: 139.5 })))
  })
})

describe('mix, darken, lighten', () => {
  it('keeps the start at 0 and arrives at the end at 1', () => {
    const from = { r: 10, g: 20, b: 30 }
    const to = { r: 110, g: 220, b: 230 }
    assert.deepEqual(toHex(mix(from, to, 0)), toHex(from))
    assert.deepEqual(toHex(mix(from, to, 1)), toHex(to))
    assert.deepEqual(toHex(mix(from, to, 0.5)), '#3c7882')
  })

  it('clamps an amount outside 0…1', () => {
    assert.equal(toHex(mix({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 5)), '#ffffff')
    assert.equal(toHex(mix({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, -5)), '#000000')
  })

  it('darkens toward black and lightens toward white', () => {
    assert.equal(toHex(darken({ r: 255, g: 255, b: 255 }, 1)), '#000000')
    assert.equal(toHex(lighten({ r: 0, g: 0, b: 0 }, 1)), '#ffffff')
  })
})

describe('luminance and contrast', () => {
  it('measures the extremes', () => {
    assert.equal(luminance({ r: 0, g: 0, b: 0 }), 0)
    assert.equal(luminance({ r: 255, g: 255, b: 255 }), 1)
  })

  it('measures black against white as 21:1, in either order', () => {
    const black = { r: 0, g: 0, b: 0 }
    const white = { r: 255, g: 255, b: 255 }
    assert.equal(contrast(black, white).toFixed(2), '21.00')
    assert.equal(contrast(white, black).toFixed(2), '21.00')
  })

  it('measures a colour against itself as 1:1', () => {
    assert.equal(contrast(parseColor('#32f08c'), parseColor('#32f08c')).toFixed(2), '1.00')
  })
})

describe('readableOn', () => {
  it('returns a colour that already clears the floor unchanged', () => {
    // The reference's own accent on its own page: 13.11:1, so nothing to fix.
    assert.equal(readableOn(parseColor('#32f08c'), DARK_PAGE, 'lighten'), '#32f08c')
  })

  it('darkens an accent on a white page until it clears AA', () => {
    const text = readableOn(parseColor('#32f08c'), LIGHT_PAGE, 'darken')
    assert.notEqual(text, '#32f08c')
    assert.ok(contrast(parseColor(text), LIGHT_PAGE) >= AA_TEXT_CONTRAST)
  })

  it('lightens an accent on a near-black page until it clears AA', () => {
    const text = readableOn(parseColor('#0a5c34'), DARK_PAGE, 'lighten')
    assert.ok(contrast(parseColor(text), DARK_PAGE) >= AA_TEXT_CONTRAST)
  })

  it('measures the quantized value, so the printed ratio is the painted one', () => {
    // Rounding is what makes this bite: a candidate that measures 4.50 at full
    // precision can quantize to 4.48, and the card would then print a promise the
    // page does not keep. Re-reading the answer from its own literal is exactly the
    // measurement the card prints.
    for (const accent of ['#32f08c', '#2f8c4a', '#7f7f7f', '#c8c8c8', '#0a9c52', '#ff6700', '#0000ff']) {
      for (const [page, direction] of [[LIGHT_PAGE, 'darken'], [DARK_PAGE, 'lighten']]) {
        const text = readableOn(parseColor(accent), page, direction)
        const measured = contrast(parseColor(text), page)
        assert.ok(
          measured >= AA_TEXT_CONTRAST,
          `${accent} on ${toHex(page)} produced ${text} at ${measured.toFixed(3)}:1`,
        )
      }
    }
  })

  it('is a fixed point: an answer already clears the floor, so it is returned again', () => {
    for (const accent of ['#32f08c', '#ff6700', '#0000ff', '#7f7f7f']) {
      for (const [page, direction] of [[LIGHT_PAGE, 'darken'], [DARK_PAGE, 'lighten']]) {
        const once = readableOn(parseColor(accent), page, direction)
        assert.equal(readableOn(parseColor(once), page, direction), once)
      }
    }
  })

  it('honours a floor above the AA default', () => {
    const text = readableOn(parseColor('#32f08c'), LIGHT_PAGE, 'darken', 7)
    assert.ok(contrast(parseColor(text), LIGHT_PAGE) >= 7)
  })
})

describe('HSL helpers', () => {
  it('round-trips a colour through hue, saturation and lightness', () => {
    for (const literal of ['#32f08c', '#ffffff', '#000000', '#0a0b0d', '#ff6700']) {
      assert.equal(toHex(fromHsl(toHsl(parseColor(literal)))), literal)
    }
  })

  it('applies hue, saturation and lightness offsets', () => {
    const moved = shift(parseColor('#32f08c'), { dh: 0, ds: 0, dl: 10 })
    assert.ok(toHsl(moved).l > toHsl(parseColor('#32f08c')).l)
    const same = shift(parseColor('#32f08c'), { dh: 0, ds: 0, dl: 0 })
    assert.equal(toHex(same), '#32f08c')
  })
})

describe('withAlpha and formatRatio', () => {
  it('writes the alpha as one byte', () => {
    assert.equal(withAlpha(parseColor('#32f08c'), 0.12), '#32f08c1f')
    assert.equal(withAlpha(parseColor('#32f08c'), 1), '#32f08cff')
    assert.equal(withAlpha(parseColor('#32f08c'), 0), '#32f08c00')
  })

  it('clamps an alpha outside 0…1', () => {
    assert.equal(withAlpha(parseColor('#32f08c'), 4), '#32f08cff')
    assert.equal(withAlpha(parseColor('#32f08c'), -4), '#32f08c00')
  })

  it('prints a ratio to two decimals with its unit', () => {
    assert.equal(formatRatio(4.5), '4.50:1')
    assert.equal(formatRatio(13.111), '13.11:1')
  })
})
