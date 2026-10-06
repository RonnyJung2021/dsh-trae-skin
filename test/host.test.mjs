/**
 * The Host half: what it publishes, what it refuses to publish, and what it keeps
 * off the generated settings pages.
 *
 * The fake context is the whole engine surface this half touches — one event, one
 * logger and one injected service — so a change in what it calls shows up here rather
 * than at boot.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const host = await loadModule('host/index.ts')
const { plainConfig, publishedSettings } = await loadModule('host/publish.ts')
const { SECTION_FIELDS } = await loadModule('constants/config.ts')
const { DEFAULT_GLOBAL_NAME, PLUGIN_ID } = await loadModule('constants/plugin.ts')

/**
 * A context that records what the plugin registers.
 * @returns the fake context and its records.
 */
function fakeContext() {
  const records = { listeners: [], injected: [], effects: [], logs: [] }
  const context = {
    logger: { debug: message => records.logs.push(message) },
    fiber: { name: 'fiber' },
    on(name, listener) {
      records.listeners.push({ name, listener })
    },
    inject(names, callback) {
      records.injected.push({ names, callback })
      const child = {
        get: name => name === 'settings' ? child.settings : undefined,
        effect: (run, label) => { records.effects.push({ label, result: run() }) },
        settings: undefined,
      }
      callback(child)
    },
  }
  return { context, records }
}

/**
 * Resolve a row config the way the Loader would, then run the host half over it.
 * @param config - raw row config.
 * @returns the records and the resolved config the row would carry.
 */
function run(config) {
  const { context, records } = fakeContext()
  host.apply(context, config)
  return { context, records }
}

/** Collect the globals a page would receive. */
function publishOf(records) {
  const table = []
  for (const { name, listener } of records.listeners) {
    assert.equal(name, 'webserver/index-inject')
    listener(table)
  }
  return table
}

describe('the row’s identity', () => {
  it('is the package name the page is served under', () => {
    assert.equal(host.name, PLUGIN_ID)
    assert.equal(host.name, 'dsh-trae-skin')
  })
})

describe('apply', () => {
  it('publishes one global carrying every knob', () => {
    const { records } = run(undefined)
    const table = publishOf(records)
    assert.equal(table.length, 1)
    const [entry] = table
    assert.equal(entry.kind, 'global')
    assert.equal(entry.name, DEFAULT_GLOBAL_NAME)
    assert.equal(entry.value.enabled, true)
    for (const field of SECTION_FIELDS) {
      assert.ok(field in entry.value, field)
    }
  })

  it('publishes the resolved values, not the half-filled row', () => {
    const { records } = run({ accent: '#FF6700', scheme: 'light', strip: false })
    const [entry] = publishOf(records)
    assert.equal(entry.value.accent, '#ff6700')
    assert.equal(entry.value.scheme, 'light')
    assert.equal(entry.value.strip, false)
    // Everything the row did not set travels at its compiled default, so the page's
    // first frame is already complete.
    assert.equal(entry.value.wordmark, 'DEEPSEEK HARNESS')
    assert.equal(entry.value.pulsePeriodMs, 1600)
  })

  it('unwraps the Loader’s volatile references before resolving them', () => {
    // Every knob is declared `.volatile()`, so the Loader hands `apply` a reference
    // object rather than a value. Passing that on would resolve the compiled default
    // and serialise to `{}`, which is the bug this pins.
    const volatile = value => ({ get: () => value, set: () => {} })
    const { records } = run({
      scheme: volatile('light'),
      accent: volatile('#ff6700'),
      wordmark: volatile('HELLO'),
      strip: volatile(false),
      pulseScale: volatile(2),
    })
    const [entry] = publishOf(records)
    assert.equal(entry.value.scheme, 'light')
    assert.equal(entry.value.accent, '#ff6700')
    assert.equal(entry.value.wordmark, 'HELLO')
    assert.equal(entry.value.strip, false)
    assert.equal(entry.value.pulseScale, 2)
  })

  it('publishes nothing at all when the row is disabled', () => {
    const { records } = run({ enabled: false })
    assert.deepEqual(records.listeners, [])
    assert.equal(records.logs.some(line => line.includes('disabled')), true)
  })

  it('honours a renamed global, and ignores an empty one', () => {
    assert.equal(publishOf(run({ globalName: '__CUSTOM__' }).records)[0].name, '__CUSTOM__')
    assert.equal(publishOf(run({ globalName: '' }).records)[0].name, DEFAULT_GLOBAL_NAME)
    assert.equal(publishOf(run({ globalName: 42 }).records)[0].name, DEFAULT_GLOBAL_NAME)
  })

  it('keeps the row off any generated settings page', () => {
    const { records } = run(undefined)
    assert.deepEqual(records.injected.map(entry => entry.names), [['settings']])
    assert.equal(records.effects.length, 1)
    assert.match(records.effects[0].label, /plugin card only/u)
  })

  it('asks the settings service to stop projecting this row automatically', () => {
    const { context, records } = fakeContext()
    const calls = []
    const original = context.inject
    context.inject = (names, callback) => {
      original(names, (child) => {
        child.settings = { configure: (presentation, owner) => { calls.push({ presentation, owner }) } }
        callback(child)
      })
    }
    host.apply(context, undefined)
    assert.deepEqual(calls, [{ presentation: { auto: false }, owner: context.fiber }])
    assert.equal(records.effects.length >= 0, true)
  })

  it('does nothing when the settings service is absent', () => {
    const { context, records } = fakeContext()
    assert.doesNotThrow(() => { host.apply(context, undefined) })
    // The effect ran and found nothing to configure, which is the documented path on
    // an engine without the service.
    assert.equal(records.effects.length, 1)
  })

  it('never throws, whatever the row holds', () => {
    for (const config of [undefined, {}, { accent: {} }, { scheme: [] }, { stripBare: 'x' }]) {
      assert.doesNotThrow(() => { host.apply(fakeContext().context, config) })
    }
  })
})

describe('publishedSettings', () => {
  it('carries the row’s knobs and nothing else', () => {
    const published = publishedSettings({
      scheme: 'dark', accent: '#32f08c', wordmark: 'DEEPSEEK HARNESS',
      strip: true, stripBare: false, pulse: true, pulseColor: 'follow',
      pulseScale: 1.6, pulsePeriodMs: 1600, pulseOpacity: 0.35, enabled: false,
    })
    assert.deepEqual(Object.keys(published).sort(), [...SECTION_FIELDS].sort())
    // `enabled` is deployment configuration, not a knob: a disabled row publishes
    // nothing, and a live one always reports itself as enabled.
    assert.equal('enabled' in published, false)
    assert.equal('globalName' in published, false)
  })
})

describe('plainConfig', () => {
  it('reads a plain config through unchanged', () => {
    const plain = plainConfig({ scheme: 'light', accent: '#ff6700' })
    assert.equal(plain.scheme, 'light')
    assert.equal(plain.accent, '#ff6700')
  })

  it('unwraps every volatile field', () => {
    const plain = plainConfig({
      scheme: { get: () => 'auto' },
      accent: { get: () => '#ff6700' },
      wordmark: { get: () => 'HI' },
      strip: { get: () => false },
      stripBare: { get: () => true },
      pulse: { get: () => false },
      pulseColor: { get: () => '#ff0000' },
      pulseScale: { get: () => 2 },
      pulsePeriodMs: { get: () => 900 },
      pulseOpacity: { get: () => 0.5 },
      enabled: { get: () => false },
    })
    assert.deepEqual(plain, {
      scheme: 'auto', accent: '#ff6700', wordmark: 'HI', strip: false, stripBare: true,
      pulse: false, pulseColor: '#ff0000', pulseScale: 2, pulsePeriodMs: 900, pulseOpacity: 0.5,
      enabled: false,
    })
  })
})

describe('the row’s schema', () => {
  const { Config } = host

  /**
   * Resolve one row config and read it back as plain values.
   *
   * Every page knob is declared volatile, so the schema hands back a reference
   * object; reading through it is the same unwrapping the Host half does, which is
   * what makes these assertions about values rather than about the protocol.
   * @param config - raw row config.
   * @returns the resolved values.
   */
  function resolve(config) {
    const row = new Config(config)
    return Object.fromEntries(Object.entries({ ...row }).map(([field, value]) => [
      field,
      typeof value?.get === 'function' ? value.get() : value,
    ]))
  }

  it('gives every knob a default, so the published value is always complete', () => {
    assert.deepEqual(resolve({}), {
      scheme: 'dark', accent: '#32f08c', wordmark: 'DEEPSEEK HARNESS', strip: true, stripBare: false,
      pulse: true, pulseColor: 'follow', pulseScale: 1.6, pulsePeriodMs: 1600, pulseOpacity: 0.35,
      enabled: true, globalName: DEFAULT_GLOBAL_NAME,
    })
  })

  it('declares every field the card edits, and no field it does not', () => {
    const declared = Object.keys({ ...new Config({}) })
    for (const field of SECTION_FIELDS) {
      assert.ok(declared.includes(field), `${field} is missing from the schema`)
    }
    assert.deepEqual(
      declared.filter(field => !SECTION_FIELDS.includes(field)).sort(),
      ['enabled', 'globalName'],
    )
  })

  it('declares the page’s knobs volatile, so saving one writes the profile patch', () => {
    const row = new Config({})
    for (const field of SECTION_FIELDS) {
      const value = row[field]
      assert.equal(typeof value?.get, 'function', `${field} should be volatile`)
    }
    // The two deployment switches are read once, at activation, and are not knobs.
    assert.notEqual(typeof row.enabled?.get, 'function')
    assert.notEqual(typeof row.globalName?.get, 'function')
  })

  it('accepts only the three shell choices', () => {
    for (const scheme of ['dark', 'light', 'auto']) {
      assert.equal(resolve({ scheme }).scheme, scheme)
    }
    assert.throws(() => new Config({ scheme: 'neon' }))
  })

  it('holds the card’s ranges, so a hand-edited patch cannot go past them', () => {
    assert.equal(resolve({ pulseScale: 2.4 }).pulseScale, 2.4)
    assert.equal(resolve({ pulsePeriodMs: 800 }).pulsePeriodMs, 800)
    assert.equal(resolve({ pulseOpacity: 0.6 }).pulseOpacity, 0.6)
    assert.throws(() => new Config({ pulseScale: 9 }))
    assert.throws(() => new Config({ pulsePeriodMs: 100 }))
    assert.throws(() => new Config({ pulseOpacity: 2 }))
  })

  it('describes every field, because a description is what the row shows', () => {
    // The descriptions live on the field schemas, not on the resolved values.
    for (const field of [...SECTION_FIELDS, 'enabled', 'globalName']) {
      const described = Config.dict[field]?.meta?.description
      assert.equal(typeof described, 'string', field)
      assert.notEqual(described, '', field)
    }
  })
})
