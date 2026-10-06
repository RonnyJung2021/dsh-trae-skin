/**
 * Resolving a row's config, and narrowing the section that comes back.
 *
 * Every one of these fields is deployment-varying input: a hand-edited patch, an
 * older host half, or a value the schema rejected. The contract is that none of them
 * can throw and none of them is silently *reinterpreted* — an out-of-range value
 * falls back to the documented default, and a form that needs to refuse instead asks
 * `invalidFields`.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const { resolveSettings, wordmarkOr, pulseColorOr } = await loadModule('utils/config.ts')
const plugins = await loadModule('constants/plugin.ts')
const section = await loadModule('utils/section.ts')
const { SECTION_DEFAULTS, sectionOf, invalidFields, sectionOps, completeSection, isDirty } = section
const { SECTION_FIELDS, ERROR_FIELDS } = await loadModule('constants/config.ts')

describe('resolveSettings', () => {
  it('compiles in the reference site’s own defaults', () => {
    assert.deepEqual(resolveSettings(undefined), {
      scheme: 'dark',
      accent: '#32f08c',
      wordmark: 'DEEPSEEK HARNESS',
      strip: true,
      stripBare: false,
      pulse: true,
      pulseColor: 'follow',
      pulseScale: 1.6,
      pulsePeriodMs: 1600,
      pulseOpacity: 0.35,
      enabled: true,
    })
  })

  it('resolves an empty row exactly like no row at all', () => {
    assert.deepEqual(resolveSettings({}), resolveSettings(undefined))
  })

  it('accepts each shell choice', () => {
    for (const scheme of ['dark', 'light', 'auto']) {
      assert.equal(resolveSettings({ scheme }).scheme, scheme)
    }
  })

  it('falls back for a shell choice it does not know', () => {
    assert.equal(resolveSettings({ scheme: 'solarized' }).scheme, 'dark')
    assert.equal(resolveSettings({ scheme: 42 }).scheme, 'dark')
  })

  it('lower-cases the accent it accepts', () => {
    assert.equal(resolveSettings({ accent: '  #32F08C ' }).accent, '#32f08c')
    assert.equal(resolveSettings({ accent: '#ABC' }).accent, '#abc')
  })

  it('falls back for an accent that is not a literal', () => {
    for (const accent of ['32f08c', 'rgb(1,2,3)', '', 12, null]) {
      assert.equal(resolveSettings({ accent }).accent, '#32f08c', String(accent))
    }
  })

  it('trims the wordmark', () => {
    assert.equal(resolveSettings({ wordmark: '  HELLO  ' }).wordmark, 'HELLO')
  })

  it('refuses an over-long wordmark instead of truncating it', () => {
    const long = 'x'.repeat(25)
    assert.equal(resolveSettings({ wordmark: long }).wordmark, 'DEEPSEEK HARNESS')
    assert.equal(wordmarkOr('x'.repeat(24), 'fallback'), 'x'.repeat(24))
  })

  it('refuses a blank wordmark', () => {
    assert.equal(resolveSettings({ wordmark: '   ' }).wordmark, 'DEEPSEEK HARNESS')
  })

  it('accepts each boolean switch, and only an explicit false turns one off', () => {
    assert.equal(resolveSettings({ strip: false }).strip, false)
    assert.equal(resolveSettings({ stripBare: true }).stripBare, true)
    assert.equal(resolveSettings({ pulse: false }).pulse, false)
    assert.equal(resolveSettings({ enabled: false }).enabled, false)
    // `0`, `'false'` and `null` are not the documented opt-out, so the default holds.
    assert.equal(resolveSettings({ enabled: 'false' }).enabled, true)
    assert.equal(resolveSettings({ pulse: 0 }).pulse, true)
  })

  it('clamps a glow spread that is out of range and falls back for a non-number', () => {
    assert.equal(resolveSettings({ pulseScale: 9 }).pulseScale, 2.4)
    assert.equal(resolveSettings({ pulseScale: 0 }).pulseScale, 1.2)
    assert.equal(resolveSettings({ pulseScale: 'big' }).pulseScale, 1.6)
  })

  it('clamps the breath period and the glow strength the same way', () => {
    assert.equal(resolveSettings({ pulsePeriodMs: 100 }).pulsePeriodMs, 800)
    assert.equal(resolveSettings({ pulsePeriodMs: 99_999 }).pulsePeriodMs, 4000)
    assert.equal(resolveSettings({ pulseOpacity: 2 }).pulseOpacity, 0.6)
    assert.equal(resolveSettings({ pulseOpacity: -1 }).pulseOpacity, 0.1)
    assert.equal(resolveSettings({ pulsePeriodMs: Number.NaN }).pulsePeriodMs, 1600)
  })

  it('accepts a glow colour literal, lower-cased', () => {
    assert.equal(resolveSettings({ pulseColor: '#AB12CD' }).pulseColor, '#ab12cd')
    assert.equal(pulseColorOr('#AB12CD', 'follow'), '#ab12cd')
  })

  it('keeps follow for anything that is neither the keyword nor a literal', () => {
    for (const pulseColor of ['#12', 'mint', '', 7]) {
      assert.equal(resolveSettings({ pulseColor }).pulseColor, 'follow', String(pulseColor))
    }
  })

  it('never throws, whatever it is handed', () => {
    for (const config of [undefined, {}, { scheme: {} }, { accent: [] }, { wordmark: {} }, { pulseScale: {} }]) {
      assert.doesNotThrow(() => resolveSettings(config))
    }
  })
})

describe('the section’s field lists', () => {
  it('reports only on knobs that are in the section', () => {
    for (const field of ERROR_FIELDS) {
      assert.ok(SECTION_FIELDS.includes(field), field)
    }
  })

  it('lists every field the host publishes, in one order both halves agree on', () => {
    assert.deepEqual([...SECTION_FIELDS], [
      'scheme', 'accent', 'wordmark', 'strip', 'stripBare',
      'pulse', 'pulseColor', 'pulseScale', 'pulsePeriodMs', 'pulseOpacity',
    ])
  })
})

describe('SECTION_DEFAULTS', () => {
  it('is the resolved default state, minus the deployment switches', () => {
    const defaults = resolveSettings(undefined)
    for (const field of SECTION_FIELDS) {
      assert.equal(SECTION_DEFAULTS[field], defaults[field], field)
    }
    assert.equal('enabled' in SECTION_DEFAULTS, false)
  })

  it('is the state the reset button writes, so it can be compared as one value', () => {
    assert.deepEqual(completeSection(undefined), SECTION_DEFAULTS)
    assert.deepEqual(completeSection({}), SECTION_DEFAULTS)
  })
})

describe('sectionOf', () => {
  it('narrows a whole section through to the typed shape', () => {
    const narrowed = sectionOf({
      scheme: 'light', accent: ' #ABC ', wordmark: ' HELLO ', strip: false, stripBare: true,
      pulse: false, pulseColor: '#FF0000', pulseScale: 2, pulsePeriodMs: 900, pulseOpacity: 0.5,
    })
    assert.deepEqual(narrowed, {
      scheme: 'light', accent: '#abc', wordmark: 'HELLO', strip: false, stripBare: true,
      pulse: false, pulseColor: '#ff0000', pulseScale: 2, pulsePeriodMs: 900, pulseOpacity: 0.5,
    })
  })

  it('returns nothing for a value that is not a section', () => {
    for (const value of [undefined, null, 'x', 7, []]) {
      assert.deepEqual(sectionOf(value), {}, String(value))
    }
  })

  it('keeps only the usable fields of a hostile section', () => {
    const narrowed = sectionOf({
      scheme: 'neon', accent: 'red', wordmark: '', strip: 'yes', stripBare: 1, pulse: null,
      pulseColor: 'mint', pulseScale: 99, pulsePeriodMs: 'soon', pulseOpacity: {},
    })
    assert.deepEqual(narrowed, {})
  })

  it('drops fields the row does not have', () => {
    assert.deepEqual(sectionOf({ nonsense: 1, enabled: false, globalName: 'x' }), {})
  })

  it('keeps the boundary values of the two closed ranges', () => {
    assert.deepEqual(sectionOf({ pulseScale: 1.2, pulsePeriodMs: 4000, pulseOpacity: 0.1 }), {
      pulseScale: 1.2, pulsePeriodMs: 4000, pulseOpacity: 0.1,
    })
    assert.deepEqual(sectionOf({ pulseScale: 2.4, pulsePeriodMs: 800, pulseOpacity: 0.6 }), {
      pulseScale: 2.4, pulsePeriodMs: 800, pulseOpacity: 0.6,
    })
  })
})

describe('invalidFields', () => {
  it('finds nothing wrong with the defaults', () => {
    assert.deepEqual(invalidFields(SECTION_DEFAULTS), [])
  })

  it('reports each knob in the order the card lists them', () => {
    const broken = {
      ...SECTION_DEFAULTS,
      scheme: 'neon',
      accent: 'mint',
      wordmark: '',
      pulseColor: 'mint',
      pulseScale: 99,
      pulsePeriodMs: 1,
      pulseOpacity: 2,
    }
    assert.deepEqual(invalidFields(broken), [
      'scheme', 'accent', 'wordmark', 'pulseColor', 'pulseScale', 'pulsePeriodMs', 'pulseOpacity',
    ])
  })

  it('refuses a wordmark one character over the limit', () => {
    assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, wordmark: 'x'.repeat(24) }), [])
    assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, wordmark: 'x'.repeat(25) }), ['wordmark'])
  })

  it('has nothing to say about a switch, which cannot hold a bad value', () => {
    assert.deepEqual(invalidFields({ ...SECTION_DEFAULTS, strip: false, stripBare: true, pulse: false }), [])
  })
})

describe('sectionOps', () => {
  it('writes one revision holding every knob, in field order', () => {
    const ops = sectionOps(SECTION_DEFAULTS)
    assert.equal(ops.length, SECTION_FIELDS.length)
    assert.deepEqual(ops.map(op => op.path[0]), [...SECTION_FIELDS])
    for (const op of ops) {
      assert.equal(op.op, 'set')
      assert.deepEqual(op.path.length, 1)
    }
  })

  it('carries the values it was given rather than the defaults', () => {
    const patched = { ...SECTION_DEFAULTS, accent: '#ff6700', wordmark: 'HELLO' }
    const ops = new Map(sectionOps(patched).map(op => [op.path[0], op.value]))
    assert.equal(ops.get('accent'), '#ff6700')
    assert.equal(ops.get('wordmark'), 'HELLO')
  })
})

describe('isDirty', () => {
  it('is true before anything has been accepted', () => {
    assert.equal(isDirty(SECTION_DEFAULTS, undefined), true)
  })

  it('compares every knob', () => {
    assert.equal(isDirty(SECTION_DEFAULTS, { ...SECTION_DEFAULTS }), false)
    /** One replacement per knob, each a value the default is not. */
    const changes = {
      scheme: 'light',
      accent: '#ff6700',
      wordmark: 'OTHER',
      strip: false,
      stripBare: true,
      pulse: false,
      pulseColor: '#ff0000',
      pulseScale: 1.8,
      pulsePeriodMs: 900,
      pulseOpacity: 0.5,
    }
    for (const [field, value] of Object.entries(changes)) {
      assert.notEqual(value, SECTION_DEFAULTS[field], `${field} needs a value the default is not`)
      assert.equal(isDirty({ ...SECTION_DEFAULTS, [field]: value }, SECTION_DEFAULTS), true, field)
    }
  })

  it('is false when the two agree, whatever the field count is', () => {
    assert.equal(isDirty({ ...SECTION_DEFAULTS }, { ...SECTION_DEFAULTS }), false)
  })
})

describe('the compiled constants the card reads', () => {
  it('names the plugin id once, as the loader row and the namespace', () => {
    assert.equal(plugins.PLUGIN_ID, 'dsh-trae-skin')
    assert.equal(plugins.SETTINGS_NAMESPACE, plugins.PLUGIN_ID)
    assert.equal(plugins.DEFAULT_GLOBAL_NAME, '__DSH_TRAE_SKIN__')
  })

  it('keeps every card range in one place', () => {
    assert.deepEqual(
      [plugins.PULSE_SCALE_MIN, plugins.PULSE_SCALE_MAX,
        plugins.PULSE_PERIOD_MIN_MS, plugins.PULSE_PERIOD_MAX_MS,
        plugins.PULSE_OPACITY_MIN, plugins.PULSE_OPACITY_MAX,
        plugins.WORDMARK_MIN_LENGTH, plugins.WORDMARK_MAX_LENGTH],
      [1.2, 2.4, 800, 4000, 0.1, 0.6, 1, 24],
    )
  })
})
