/**
 * The card's copy, read from the package's own `locale/` dictionaries.
 *
 * The plugin page reads `locale/*.json` for the card's title and description; the
 * card's body — labels, hints, validation messages — comes from the very same
 * files, so the plugin's text lives in one place and neither language is written
 * into a component. English is the fallback a missing key lands on.
 */

import en from '../../locale/en.json'
import zh from '../../locale/zh.json'
import type { PanelCopy } from '../types/panel.ts'

/**
 * The keys this module reads, so a test can prove both dictionaries carry them.
 * @remarks Kept beside {@link panelCopy} rather than derived from it: the point is
 *          to fail when one of the two drifts apart, and a list derived from the
 *          reader would drift with it.
 */
export const PANEL_KEYS = [
  'noteReady', 'noteLoading', 'noteUnavailable', 'noteStaleHost',
  'save', 'reset', 'stateSaved', 'stateDirty', 'stateClean', 'stateLocked',
  'derived', 'derivedFill', 'derivedHover', 'derivedWash',
  'derivedTextLight', 'derivedTextDark', 'derivedGradientLight', 'derivedGradientDark',
  'pulseGroup', 'stripOffNote',
  'schemeDark', 'schemeLight', 'schemeAuto',
  'pulseColorFollow', 'pulseColorLiteral',
  'fieldScheme', 'fieldSchemeHint',
  'fieldAccent', 'fieldAccentHint',
  'fieldWordmark', 'fieldWordmarkHint',
  'fieldStrip', 'fieldStripHint',
  'fieldStripBare', 'fieldStripBareHint',
  'fieldPulse', 'fieldPulseHint',
  'fieldPulseColor', 'fieldPulseColorHint',
  'fieldPulseScale', 'fieldPulseScaleHint',
  'fieldPulsePeriodMs', 'fieldPulsePeriodMsHint',
  'fieldPulseOpacity', 'fieldPulseOpacityHint',
  'errorScheme', 'errorAccent', 'errorWordmark',
  'errorPulseColor', 'errorPulseScale', 'errorPulsePeriodMs', 'errorPulseOpacity',
] as const

/** The two words the status band announces and prints. */
export const STRIP_KEYS = ['idle', 'busy'] as const

/** What the band's live region says. */
export interface StripCopy {
  /** Nothing is being produced. */
  readonly idle: string
  /** The product reports reasoning or answering. */
  readonly busy: string
}

/**
 * One section of one dictionary, or an empty object.
 * @param dictionary - a parsed locale file.
 * @param name - section to read.
 * @returns the section, or an empty object when it is absent.
 */
function sectionOf(dictionary: unknown, name: string): Record<string, unknown> {
  const section = typeof dictionary === 'object' && dictionary !== null
    ? Reflect.get(dictionary, name)
    : undefined
  return typeof section === 'object' && section !== null ? section as Record<string, unknown> : {}
}

/**
 * Read one string from one dictionary, falling back to the English one.
 * @param section - the chosen dictionary's section.
 * @param english - the English section.
 * @param key - key to read.
 * @returns the string, or the key itself when neither dictionary carries it.
 */
function text(section: Record<string, unknown>, english: Record<string, unknown>, key: string): string {
  for (const source of [section, english]) {
    const value = source[key]
    if (typeof value === 'string' && value !== '') return value
  }
  return key
}

/**
 * Pick a dictionary for a page language.
 * @param language - a BCP 47 tag, e.g. `zh-CN`; the page's own by default.
 * @returns the dictionary whose language matches, English otherwise.
 */
function dictionaryFor(language: string): unknown {
  return language.toLowerCase().startsWith('zh') ? zh : en
}

/**
 * Read one section of the dictionary matching a language.
 * @param language - a BCP 47 tag; the browser's own by default.
 * @param name - section to read.
 * @returns the reader for that section, English as the fallback.
 */
function readerFor(language: string | undefined, name: string): (key: string) => string {
  const tag = language ?? (typeof navigator === 'undefined' ? 'en' : navigator.language)
  const english = sectionOf(en, name)
  const chosen = sectionOf(dictionaryFor(tag), name)
  return (key: string): string => text(chosen, english, key)
}

/**
 * Read the band's two words.
 * @param language - a BCP 47 tag; the browser's own by default.
 * @returns the idle and busy labels.
 */
export function stripCopy(language?: string): StripCopy {
  const read = readerFor(language, 'strip')
  return { idle: read('idle'), busy: read('busy') }
}

/**
 * Read the card's copy.
 * @param language - a BCP 47 tag; the browser's own by default.
 * @returns every string the card renders.
 */
export function panelCopy(language?: string): PanelCopy {
  const read = readerFor(language, 'panel')
  return {
    noteReady: read('noteReady'),
    noteLoading: read('noteLoading'),
    noteUnavailable: read('noteUnavailable'),
    noteStaleHost: read('noteStaleHost'),
    save: read('save'),
    reset: read('reset'),
    stateSaved: read('stateSaved'),
    stateDirty: read('stateDirty'),
    stateClean: read('stateClean'),
    stateLocked: read('stateLocked'),
    derived: read('derived'),
    derivedFill: read('derivedFill'),
    derivedHover: read('derivedHover'),
    derivedWash: read('derivedWash'),
    derivedTextLight: read('derivedTextLight'),
    derivedTextDark: read('derivedTextDark'),
    derivedGradientLight: read('derivedGradientLight'),
    derivedGradientDark: read('derivedGradientDark'),
    pulseGroup: read('pulseGroup'),
    stripOffNote: read('stripOffNote'),
    schemeOptions: [
      { value: 'dark', label: read('schemeDark') },
      { value: 'light', label: read('schemeLight') },
      { value: 'auto', label: read('schemeAuto') },
    ],
    pulseColorOptions: [
      { value: 'follow', label: read('pulseColorFollow') },
      { value: 'literal', label: read('pulseColorLiteral') },
    ],
    // Keyed by the one field list the card edits and the Host publishes: a knob
    // added there is a type error here until it has copy.
    field: {
      scheme: { label: read('fieldScheme'), hint: read('fieldSchemeHint') },
      accent: { label: read('fieldAccent'), hint: read('fieldAccentHint') },
      wordmark: { label: read('fieldWordmark'), hint: read('fieldWordmarkHint') },
      strip: { label: read('fieldStrip'), hint: read('fieldStripHint') },
      stripBare: { label: read('fieldStripBare'), hint: read('fieldStripBareHint') },
      pulse: { label: read('fieldPulse'), hint: read('fieldPulseHint') },
      pulseColor: { label: read('fieldPulseColor'), hint: read('fieldPulseColorHint') },
      pulseScale: { label: read('fieldPulseScale'), hint: read('fieldPulseScaleHint') },
      pulsePeriodMs: { label: read('fieldPulsePeriodMs'), hint: read('fieldPulsePeriodMsHint') },
      pulseOpacity: { label: read('fieldPulseOpacity'), hint: read('fieldPulseOpacityHint') },
    },
    error: {
      scheme: read('errorScheme'),
      accent: read('errorAccent'),
      wordmark: read('errorWordmark'),
      pulseColor: read('errorPulseColor'),
      pulseScale: read('errorPulseScale'),
      pulsePeriodMs: read('errorPulsePeriodMs'),
      pulseOpacity: read('errorPulseOpacity'),
    },
  }
}
