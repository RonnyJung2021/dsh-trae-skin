/**
 * The coercions every untrusted field passes through.
 *
 * These are the functions that decide what a hand-edited patch or an older host half
 * can do to the page, so each one is pinned on both sides: what it accepts, and what
 * it refuses.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const { isRecord, isNumberWithin, numberWithin, numberOr, nonBlankText, booleanOr } =
  await loadModule('utils/value.ts')

describe('isRecord', () => {
  it('accepts a plain object', () => {
    assert.equal(isRecord({}), true)
    assert.equal(isRecord({ a: 1 }), true)
  })

  it('refuses everything that is not an object', () => {
    for (const value of [null, undefined, 0, '', 'x', true, []]) {
      // An array is an object to `typeof`, and reading fields off one is still
      // meaningful, so it is accepted; the rest are not.
      if (Array.isArray(value)) continue
      assert.equal(isRecord(value), false, `expected ${String(value)} to be refused`)
    }
  })
})

describe('isNumberWithin', () => {
  it('accepts the bounds themselves', () => {
    assert.equal(isNumberWithin(1.2, 1.2, 2.4), true)
    assert.equal(isNumberWithin(2.4, 1.2, 2.4), true)
  })

  it('refuses values outside the range', () => {
    assert.equal(isNumberWithin(1.19, 1.2, 2.4), false)
    assert.equal(isNumberWithin(2.41, 1.2, 2.4), false)
  })

  it('refuses numbers that are not finite, and values that are not numbers', () => {
    assert.equal(isNumberWithin(Number.NaN, 0, 1), false)
    assert.equal(isNumberWithin(Number.POSITIVE_INFINITY, 0, 1), false)
    assert.equal(isNumberWithin('0.5', 0, 1), false)
    assert.equal(isNumberWithin(undefined, 0, 1), false)
  })
})

describe('numberWithin', () => {
  it('clamps to the range', () => {
    assert.equal(numberWithin(5, 0, 1), 1)
    assert.equal(numberWithin(-5, 0, 1), 0)
    assert.equal(numberWithin(0.5, 0, 1), 0.5)
  })

  it('reports a non-number as undefined rather than clamping it', () => {
    assert.equal(numberWithin('0.5', 0, 1), undefined)
    assert.equal(numberWithin(Number.NaN, 0, 1), undefined)
  })
})

describe('numberOr', () => {
  it('falls back for anything that is not a usable number', () => {
    assert.equal(numberOr('0.5', 0.35, 0.1, 0.6), 0.35)
    assert.equal(numberOr(undefined, 0.35, 0.1, 0.6), 0.35)
    assert.equal(numberOr(Number.NaN, 0.35, 0.1, 0.6), 0.35)
  })

  it('clamps a number it accepts', () => {
    assert.equal(numberOr(9, 0.35, 0.1, 0.6), 0.6)
  })
})

describe('nonBlankText', () => {
  it('trims what it accepts', () => {
    assert.equal(nonBlankText('  hello  ', 'x'), 'hello')
  })

  it('falls back on blank, empty and non-string values', () => {
    assert.equal(nonBlankText('   ', 'x'), 'x')
    assert.equal(nonBlankText('', 'x'), 'x')
    assert.equal(nonBlankText(12, 'x'), 'x')
    assert.equal(nonBlankText(undefined, 'x'), 'x')
  })
})

describe('booleanOr', () => {
  it('keeps the fallback when nothing was configured', () => {
    assert.equal(booleanOr(undefined, true), true)
    assert.equal(booleanOr(undefined, false), false)
  })

  it('treats only an explicit false as off', () => {
    assert.equal(booleanOr(false, true), false)
    assert.equal(booleanOr(true, false), true)
    // Not the documented opt-out, so the default stands rather than a part of the
    // skin being switched off by a typo.
    assert.equal(booleanOr('false', true), true)
    assert.equal(booleanOr(0, true), true)
    assert.equal(booleanOr(null, true), true)
  })
})
