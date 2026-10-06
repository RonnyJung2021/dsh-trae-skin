/**
 * The two dictionaries, and the fallback between them.
 *
 * The card's text lives in `locale/`, never in a component, so the one failure mode
 * worth pinning is drift: a key the reader asks for that one of the two files does not
 * carry. Both lists are maintained apart from the reader on purpose — a list derived
 * from the reader would drift with it.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const { PANEL_KEYS, STRIP_KEYS, panelCopy, stripCopy } = await loadModule('client/copy.ts')
const { SECTION_FIELDS, ERROR_FIELDS } = await loadModule('constants/config.ts')

/**
 * Read one locale file.
 * @param language - file name without its extension.
 * @returns the parsed dictionary.
 */
function dictionary(language) {
  return JSON.parse(readFileSync(join(root, 'locale', `${language}.json`), 'utf8'))
}

describe('the dictionaries', () => {
  for (const language of ['en', 'zh']) {
    it(`carry every key the card reads, in ${language}`, () => {
      const panel = dictionary(language).panel
      for (const key of PANEL_KEYS) {
        assert.equal(typeof panel[key], 'string', `${language}.panel.${key}`)
        assert.notEqual(panel[key], '', `${language}.panel.${key}`)
      }
    })

    it(`carry every key the band reads, in ${language}`, () => {
      const strip = dictionary(language).strip
      for (const key of STRIP_KEYS) {
        assert.equal(typeof strip[key], 'string', `${language}.strip.${key}`)
        assert.notEqual(strip[key], '', `${language}.strip.${key}`)
      }
    })

    it(`names the plugin and what it is in its meta, in ${language}`, () => {
      const meta = dictionary(language).meta
      assert.equal(meta.title, 'dsh-trae-skin')
      assert.equal(typeof meta.description, 'string')
      assert.ok(meta.description.length > 40, 'the description is what the plugin page shows')
    })
  }

  it('have the same key set, so neither language is a partial translation', () => {
    assert.deepEqual(Object.keys(dictionary('zh').panel).sort(), Object.keys(dictionary('en').panel).sort())
    assert.deepEqual(Object.keys(dictionary('zh').strip).sort(), Object.keys(dictionary('en').strip).sort())
  })

  it('carry no key the card cannot reach', () => {
    // A key nothing reads is a string that will never be translated again.
    const known = new Set(PANEL_KEYS)
    for (const key of Object.keys(dictionary('en').panel)) {
      assert.ok(known.has(key), `locale/*.json.panel.${key} is never read`)
    }
  })
})

describe('the copy the card renders', () => {
  it('labels every knob the row has', () => {
    for (const language of ['en', 'zh']) {
      const copy = panelCopy(language)
      for (const field of SECTION_FIELDS) {
        assert.equal(typeof copy.field[field].label, 'string', `${language}.${field}.label`)
        assert.notEqual(copy.field[field].label, '', `${language}.${field}.label`)
        assert.equal(typeof copy.field[field].hint, 'string', `${language}.${field}.hint`)
        assert.notEqual(copy.field[field].hint, '', `${language}.${field}.hint`)
      }
    }
  })

  it('has a message for every knob a draft can be refused on', () => {
    for (const language of ['en', 'zh']) {
      const copy = panelCopy(language)
      for (const field of ERROR_FIELDS) {
        assert.equal(typeof copy.error[field], 'string', `${language}.${field}`)
        assert.notEqual(copy.error[field], '', `${language}.${field}`)
      }
    }
  })

  it('lists the three shell choices and the two glow modes', () => {
    for (const language of ['en', 'zh']) {
      const copy = panelCopy(language)
      assert.deepEqual(copy.schemeOptions.map(option => option.value), ['dark', 'light', 'auto'])
      assert.deepEqual(copy.pulseColorOptions.map(option => option.value), ['follow', 'literal'])
      for (const option of [...copy.schemeOptions, ...copy.pulseColorOptions]) {
        assert.notEqual(option.label, '', `${language}.${option.value}`)
      }
    }
  })

  it('keeps the labels short enough to be labels', () => {
    // A form label is a name, not a sentence. Chinese carries the same meaning in about
    // half the characters English needs, so the bound is per language rather than one
    // number that would only ever fit one of them.
    const LIMIT = { zh: 12, en: 20 }
    for (const language of ['en', 'zh']) {
      const copy = panelCopy(language)
      const labels = [
        ...Object.values(copy.field).map(entry => entry.label),
        copy.derived, copy.derivedFill, copy.derivedHover, copy.derivedWash,
        copy.derivedTextLight, copy.derivedTextDark,
        copy.derivedGradientLight, copy.derivedGradientDark,
        copy.pulseGroup, copy.save, copy.reset,
      ]
      for (const label of labels) {
        assert.ok(label.length <= LIMIT[language], `${language}: "${label}" is ${label.length} characters`)
        assert.ok(!label.includes('（'), `${language}: "${label}" carries a parenthetical aside`)
      }
    }
  })

  it('keeps every hint to one sentence a reader can scan', () => {
    const LIMIT = { zh: 60, en: 140 }
    for (const language of ['en', 'zh']) {
      const copy = panelCopy(language)
      for (const [field, entry] of Object.entries(copy.field)) {
        assert.ok(entry.hint.length <= LIMIT[language], `${language}.${field}: ${entry.hint.length} characters`)
        // One sentence: a second one is a paragraph, and a paragraph in a hint is how a
        // form starts explaining itself instead of saying what the field is for. A period
        // between digits is a decimal point — "1.82:1" is one sentence, not two.
        const sentences = entry.hint.match(/(?<!\d)[.!?。！？](?=\s|$)/gu) ?? []
        assert.ok(sentences.length <= 1, `${language}.${field}: ${entry.hint}`)
      }
    }
  })

  it('reads the language it was asked for, and English for one it does not have', () => {
    assert.equal(panelCopy('zh-CN').save, '保存')
    assert.equal(panelCopy('en-US').save, 'Save')
    assert.equal(panelCopy('fr-FR').save, 'Save')
    assert.equal(stripCopy('zh').idle, '空闲')
    assert.equal(stripCopy('de').idle, 'Idle')
  })

  it('never falls through to an empty string, whatever the tag looks like', () => {
    for (const tag of ['', 'zh', 'ZH-cn', 'en', 'pt-BR', 'x']) {
      const copy = panelCopy(tag)
      const flat = Object.entries(copy).filter(([, value]) => typeof value === 'string')
      assert.ok(flat.length >= 20, `only ${flat.length} strings for ${tag}`)
      for (const [key, value] of flat) {
        assert.notEqual(value, '', `${tag}: ${key}`)
      }
      for (const [field, entry] of Object.entries(copy.field)) {
        assert.notEqual(entry.label, '', `${tag}: ${field}.label`)
        assert.notEqual(entry.hint, '', `${tag}: ${field}.hint`)
      }
      for (const [field, message] of Object.entries(copy.error)) {
        assert.notEqual(message, '', `${tag}: error.${field}`)
      }
    }
  })
})
