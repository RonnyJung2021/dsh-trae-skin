/**
 * The shell tables and the token remap.
 *
 * Two halves of one contract. The shells are the reference site's own values, so the
 * literals are pinned; the remap is what the skin is allowed to touch, so **what is
 * absent from it matters as much as what is in it** — the state colours, the toast
 * and tooltip surfaces, the diff backgrounds and the one inverted-label token are
 * left to the product on purpose.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadModule } from './load-module.mjs'

const palette = await loadModule('constants/palette.ts')
const { DARK_SHELL, LIGHT_SHELL, SHELLS, SHELL_VARIABLES, DYNAMIC_VARIABLES, ALIAS_MAP, CHROME_VARIABLES, FONT_VARIABLES, FONT_STACKS } =
  palette
const client = await loadModule('client/palette.ts')
const { shellDeclarations, shellIdFor, productDarkFor, stripModeFor, fadeOf } = client
const { isColor, contrast, parseColor } = await loadModule('utils/color.ts')

describe('the two shells', () => {
  it('paints the reference site’s own page', () => {
    assert.equal(DARK_SHELL.id, 'dark')
    assert.equal(DARK_SHELL.page, '#0a0b0d')
    assert.equal(DARK_SHELL.raised, '#121314')
    assert.equal(DARK_SHELL.ink, '#f5f9fe')
  })

  it('paints the light counterpart from the site’s own light block', () => {
    assert.equal(LIGHT_SHELL.id, 'light')
    assert.equal(LIGHT_SHELL.page, '#ffffff')
    assert.equal(LIGHT_SHELL.ink, '#1a1a1a')
  })

  it('uses the reference’s three hairline alphas in each shell', () => {
    assert.deepEqual(
      [DARK_SHELL.ruleL1, DARK_SHELL.ruleL2, DARK_SHELL.ruleL3],
      ['#ffffff0f', '#ffffff1f', '#ffffff2e'],
    )
    assert.deepEqual(
      [LIGHT_SHELL.ruleL1, LIGHT_SHELL.ruleL2, LIGHT_SHELL.ruleL3],
      ['#4d6b991f', '#4d6b992e', '#4d6b995c'],
    )
  })

  it('keeps the overlay ladder monotonic, so hover and pressed stay distinct', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const alphas = [shell.overlayL1, shell.overlayL2, shell.overlayL3, shell.overlayL4]
        .map(literal => Number.parseInt(literal.slice(7), 16))
      assert.deepEqual(alphas, [...alphas].sort((a, b) => a - b), shell.id)
      assert.equal(new Set(alphas).size, 4, shell.id)
    }
  })

  it('carries the reference’s floating recipe: a half-pixel inner highlight plus one drop', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      assert.match(shell.elevation, /^inset 0 0\.5px 0 0 /u, shell.id)
      assert.match(shell.elevation, /, 0 \d+px \d+px 0 /u, shell.id)
    }
  })

  it('corrects the light elevation weight, where a white highlight would do nothing', () => {
    assert.ok(DARK_SHELL.elevation.includes('rgb(255 255 255'))
    assert.ok(LIGHT_SHELL.elevation.includes('rgb(0 0 0'))
  })

  it('lists both shells under their own ids', () => {
    assert.deepEqual(Object.keys(SHELLS).sort(), ['dark', 'light'])
    assert.equal(SHELLS.dark, DARK_SHELL)
    assert.equal(SHELLS.light, LIGHT_SHELL)
  })

  it('names the direction the accent travels in each shell', () => {
    assert.equal(DARK_SHELL.textDirection, 'lighten')
    assert.equal(LIGHT_SHELL.textDirection, 'darken')
  })

  it('gives every declared field a value, so no shell block writes "undefined"', () => {
    for (const [field, variable] of Object.entries(SHELL_VARIABLES)) {
      for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
        const value = shell[field]
        assert.equal(typeof value, 'string', `${shell.id}.${field} (${variable})`)
        assert.notEqual(value, '', `${shell.id}.${field}`)
      }
    }
  })
})

describe('the token remap', () => {
  /** Tokens the skin must never repoint, whatever else it does. */
  const LEFT_ALONE = [
    // State colours: DSH switches these on the product's own dark flag.
    '--dsw-alias-state-warn-primary', '--dsw-alias-state-warn-secondary', '--dsw-alias-state-warn-tertiary',
    '--dsw-alias-state-success-primary', '--dsw-alias-state-success-secondary', '--dsw-alias-state-success-tertiary',
    '--dsw-alias-state-error-primary', '--dsw-alias-state-error-secondary',
    // Floating notices and their labels.
    '--dsw-alias-toast-bg', '--dsw-alias-toast-label',
    '--dsw-alias-tooltip-bg', '--dsw-alias-tooltip-key-bg',
    // Diff grounds and the syntax palette.
    '--dsw-alias-code-diff-added', '--dsw-alias-code-diff-deleted',
    '--dsw-alias-file-diff-added-bg', '--dsw-alias-file-diff-deleted-bg',
    // The one token the product spends on labels over dark surfaces.
    '--dsw-alias-label-primary-inverted',
  ]

  it('leaves every state, notice, diff and inverted-label token to the product', () => {
    const touched = new Set(ALIAS_MAP.map(([token]) => token))
    for (const token of LEFT_ALONE) {
      assert.equal(touched.has(token), false, `${token} must not be remapped`)
    }
  })

  it('points every alias at a skin variable or a literal the skin declares', () => {
    for (const [token, value] of ALIAS_MAP) {
      assert.match(token, /^--(dsw|ds|dsh)-/u, token)
      assert.match(value, /^var\(--dsh-trae-[\w-]+\)$/u, `${token} → ${value}`)
    }
    for (const [token, value] of CHROME_VARIABLES) {
      assert.match(token, /^--(dsw|ds|dsh)-/u, token)
      assert.ok(value !== '', token)
    }
  })

  it('names each product token once', () => {
    const tokens = [...ALIAS_MAP, ...CHROME_VARIABLES].map(([token]) => token)
    assert.equal(new Set(tokens).size, tokens.length)
  })

  it('spends the radius scale on the reference’s three steps and nothing between', () => {
    const radii = CHROME_VARIABLES
      .filter(([token]) => token.startsWith('--dsw-radius'))
      .map(([, value]) => value)
    assert.deepEqual(radii, ['2px', '4px', '4px', '8px', '8px', '8px'])
    for (const value of radii) assert.ok(['2px', '4px', '8px'].includes(value), value)
  })

  it('gives the focus ring a 1px neutral stroke, never the brand colour', () => {
    const width = CHROME_VARIABLES.find(([token]) => token === '--dsw-focus-ring-width')
    const color = CHROME_VARIABLES.find(([token]) => token === '--dsw-focus-ring-color')
    assert.deepEqual(width, ['--dsw-focus-ring-width', '1px'])
    assert.equal(color?.[1], 'var(--dsh-trae-faint)')
    assert.ok(!String(color?.[1]).includes('accent'), 'the brand colour is reserved for state')
  })

  it('spends the three faces the reference uses', () => {
    const map = new Map(CHROME_VARIABLES)
    assert.deepEqual(map.get('--dsw-font-family'), 'var(--dsh-trae-font-ui)')
    assert.deepEqual(map.get('--dsw-font-family-brand'), 'var(--dsh-trae-font-display)')
    assert.deepEqual(map.get('--ds-font-family-code'), 'var(--dsh-trae-font-mono)')
    assert.deepEqual(FONT_VARIABLES.map(([token]) => token), [
      '--dsh-trae-font-ui', '--dsh-trae-font-display', '--dsh-trae-font-mono',
    ])
  })

  it('names the platform face before Inter, and ships no font file', () => {
    assert.ok(FONT_STACKS.ui.startsWith('-apple-system'))
    assert.ok(FONT_STACKS.ui.indexOf('Inter') < FONT_STACKS.ui.indexOf('Segoe UI'))
    assert.ok(FONT_STACKS.mono.startsWith("'JetBrains Mono'"))
    for (const stack of Object.values(FONT_STACKS)) {
      assert.ok(!stack.includes('url('), 'a face must not be a packaged asset')
    }
  })

  it('spends the accent on the reference’s primary call to action', () => {
    const map = new Map(ALIAS_MAP)
    assert.equal(map.get('--dsw-alias-button-primary-fill'), 'var(--dsh-trae-accent)')
    assert.equal(map.get('--dsw-alias-button-primary-hover'), 'var(--dsh-trae-accent-hover)')
    assert.equal(map.get('--dsw-alias-label-primary-foreground'), 'var(--dsh-trae-on-accent)')
    assert.equal(map.get('--dsw-alias-link'), 'var(--dsh-trae-accent-text)')
  })

  it('repaints the scrollbar thumbs from the shell’s own two steps', () => {
    const map = new Map(ALIAS_MAP)
    for (const token of ['--dsw-alias-scrollbar-bg-l1', '--dsw-alias-scrollbar-bg-l2']) {
      assert.equal(map.get(token), 'var(--dsh-trae-scroll-thumb)')
    }
    for (const token of ['--dsw-alias-scrollbar-hover-l1', '--dsw-alias-scrollbar-hover-l2']) {
      assert.equal(map.get(token), 'var(--dsh-trae-scroll-thumb-hover)')
    }
  })

  it('declares every variable it spends, so nothing points at an undefined name', () => {
    const declared = new Set([
      ...Object.values(SHELL_VARIABLES),
      ...DYNAMIC_VARIABLES,
      ...FONT_VARIABLES.map(([token]) => token),
      '--dsh-trae-think',
      '--dsh-trae-think-select',
    ])
    for (const [token, value] of ALIAS_MAP) {
      const name = /^var\((--dsh-trae-[\w-]+)\)$/u.exec(value)?.[1]
      assert.ok(name !== undefined && declared.has(name), `${token} spends ${value}, which nothing declares`)
    }
  })
})

describe('shellDeclarations', () => {
  it('covers every shell variable, in table order', () => {
    const names = shellDeclarations(DARK_SHELL).map(([name]) => name)
    for (const variable of Object.values(SHELL_VARIABLES)) {
      assert.ok(names.includes(variable), variable)
    }
  })

  it('appends the two fade masks, computed from the surfaces they sit on', () => {
    const declarations = new Map(shellDeclarations(LIGHT_SHELL))
    assert.equal(declarations.get('--dsh-trae-think'), fadeOf(LIGHT_SHELL.terrace))
    assert.equal(declarations.get('--dsh-trae-think-select'), fadeOf(LIGHT_SHELL.raised))
  })
})

describe('fadeOf', () => {
  it('ramps from the surface to nothing at the reference’s own stop', () => {
    assert.equal(fadeOf('#1c1c1d'), 'linear-gradient(180deg, #1c1c1d 20.19%, #1c1c1d00 100%)')
  })
})

describe('shellIdFor', () => {
  it('follows the document in auto and obeys an explicit choice', () => {
    assert.equal(shellIdFor('auto', true), 'dark')
    assert.equal(shellIdFor('auto', false), 'light')
    assert.equal(shellIdFor('dark', false), 'dark')
    assert.equal(shellIdFor('light', true), 'light')
  })
})

describe('productDarkFor', () => {
  it('forces the product’s flag for an explicit shell', () => {
    assert.equal(productDarkFor('dark'), true)
    assert.equal(productDarkFor('light'), false)
  })

  it('leaves the flag alone in auto, because writing what the mode follows is self-referential', () => {
    assert.equal(productDarkFor('auto'), undefined)
  })
})

describe('stripModeFor', () => {
  it('maps the two switches onto the band’s three shapes', () => {
    assert.equal(stripModeFor({ strip: false, stripBare: false }), 'off')
    assert.equal(stripModeFor({ strip: false, stripBare: true }), 'off')
    assert.equal(stripModeFor({ strip: true, stripBare: false }), 'full')
    assert.equal(stripModeFor({ strip: true, stripBare: true }), 'bare')
  })
})

describe('the reference’s own literals', () => {
  it('are readable, so a typo cannot ship as a silent fallback', () => {
    for (const field of ['page', 'raised', 'terrace', 'ink', 'muted', 'faint', 'onAccent']) {
      assert.equal(isColor(DARK_SHELL[field]), true, `dark.${field}`)
      assert.equal(isColor(LIGHT_SHELL[field]), true, `light.${field}`)
    }
    // The washes and the scrollbar thumbs are eight-digit literals on purpose: they
    // are inks over a surface, not flat colours.
    for (const field of ['ruleL1', 'ruleL2', 'ruleL3', 'overlayL1', 'overlayL4', 'scrollThumb', 'scrollThumbHover']) {
      assert.match(DARK_SHELL[field], /^#[0-9a-f]{8}$/u, `dark.${field}`)
      assert.match(LIGHT_SHELL[field], /^#[0-9a-f]{8}$/u, `light.${field}`)
    }
  })

  it('gives every shell text that clears AA on its own page', () => {
    for (const shell of [DARK_SHELL, LIGHT_SHELL]) {
      const page = parseColor(shell.page)
      for (const field of ['ink', 'muted', 'faint']) {
        const ratio = contrast(parseColor(shell[field]), page)
        assert.ok(ratio >= 4.5, `${shell.id}.${field} measured ${ratio.toFixed(2)}:1`)
      }
    }
  })
})
