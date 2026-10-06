/**
 * The stylesheet, as a set of promises about the page.
 *
 * Half of these are reverse assertions, and they are the half that matters: the four
 * effects the reference site never uses, the generated class names the skin must not
 * depend on, the tokens it must not repoint, and the order of the two shell blocks.
 * A skin fails by doing too much far more often than by doing too little.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createFakeDocument } from './fake-dom.mjs'
import { loadModule } from './load-module.mjs'

const styles = await loadModule('client/styles/page.ts')
const panelStyles = await loadModule('client/styles/panel.ts')
const dom = await loadModule('constants/dom.ts')
const { LIGHT_SHELL, DARK_SHELL } = await loadModule('constants/palette.ts')
const { STRIP_HEIGHT, LIGHT_RADIUS } = await loadModule('constants/config.ts')

const CSS = styles.pageStyles()

/** The stylesheet without comments, so a selector is never read as prose. */
const CODE = CSS.replaceAll(/\/\*[\s\S]*?\*\//gu, '')

/**
 * Every style rule in a stylesheet, at any nesting depth.
 *
 * A regex over `selector { body }` is not enough for this sheet: comments sit above
 * most rules and would be read as part of the selector, and `@media` wraps rules that
 * the reduced-motion assertions have to reach. So the braces are walked once, and a
 * rule is kept when its prelude is a selector — an at-rule's own block is a wrapper,
 * and a keyframe's `0%` block is not a selector either.
 * @param css - the stylesheet text.
 * @returns one entry per style rule, with the media condition around it, if any.
 */
function rulesOf(css) {
  const text = css.replaceAll(/\/\*[\s\S]*?\*\//gu, '')
  const found = []
  const stack = []
  let start = 0
  for (let at = 0; at < text.length; at += 1) {
    const character = text[at]
    if (character === '{') {
      stack.push(text.slice(start, at).trim())
      start = at + 1
      continue
    }
    if (character !== '}') continue
    const prelude = stack.pop()
    const body = text.slice(start, at)
    start = at + 1
    if (prelude === undefined || prelude.startsWith('@') || prelude.includes('%')) continue
    // A rule inside @keyframes has a percentage prelude and was skipped above; a rule
    // inside @media is a real rule and keeps its condition.
    const media = stack.find(entry => entry.startsWith('@media'))
    // One selector list may be wrapped over several lines; collapse it, so a caller can
    // match on the selector it reads in the source.
    found.push({ selector: prelude.replace(/\s+/gu, ' '), body, media })
  }
  return found
}

const RULES = rulesOf(CODE)

/**
 * Every rule whose selector matches a pattern.
 * @param pattern - selector pattern to look for.
 * @returns the matching rules.
 */
function blocksFor(pattern) {
  return RULES.filter(rule => pattern.test(rule.selector))
}

/**
 * The value of one declaration inside a block body.
 * @param body - the block body.
 * @param property - property name.
 * @returns the value, or undefined.
 */
function declaration(body, property) {
  const match = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'u').exec(body)
  return match?.[1].trim()
}

describe('the two shell blocks', () => {
  it('are matched on the body that carries the skin, at the same specificity', () => {
    const light = blocksFor(/^body\[data-dsh-trae\]\[data-dsh-trae-scheme='light'\]$/u)
    const dark = blocksFor(/^body\[data-dsh-trae\]\[data-dsh-trae-scheme='dark'\]$/u)
    assert.equal(light.length, 1)
    assert.equal(dark.length, 1)
    // Same shape of selector, so neither outranks the other and source order decides.
    assert.equal(
      light[0].selector.replace("'light'", ''),
      dark[0].selector.replace("'dark'", ''),
    )
  })

  it('put the dark block after the light one, which is what makes it win', () => {
    const light = CSS.indexOf("data-dsh-trae-scheme='light']")
    const dark = CSS.indexOf("data-dsh-trae-scheme='dark']")
    assert.ok(light !== -1 && dark !== -1)
    assert.ok(light < dark, 'the dark block must come second')
  })

  it('declare each shell’s own page colour', () => {
    const light = blocksFor(/light'\]$/u)[0]
    const dark = blocksFor(/dark'\]$/u)[0]
    assert.equal(declaration(light.body, '--dsh-trae-page'), LIGHT_SHELL.page)
    assert.equal(declaration(dark.body, '--dsh-trae-page'), DARK_SHELL.page)
  })

  it('declare the same set of variables in both, so neither shell is half-painted', () => {
    const namesOf = body => [...body.matchAll(/(--dsh-trae-[\w-]+)\s*:/gu)].map(match => match[1]).sort()
    const light = namesOf(blocksFor(/light'\]$/u)[0].body)
    const dark = namesOf(blocksFor(/dark'\]$/u)[0].body)
    assert.deepEqual(light, dark)
    assert.ok(light.length >= 25, `only ${light.length} shell variables`)
  })

  it('declare the colour scheme for the browser’s own form controls', () => {
    assert.equal(declaration(blocksFor(/light'\]$/u)[0].body, 'color-scheme'), 'light')
    assert.equal(declaration(blocksFor(/dark'\]$/u)[0].body, 'color-scheme'), 'dark')
  })
})

describe('the reference’s own geometry', () => {
  it('uses only 2, 4 and 8 pixels for corners', () => {
    const radii = [...CSS.matchAll(/--dsw-radius-[\w-]+\s*:\s*([^;!]+)/gu)].map(match => match[1].trim())
    assert.ok(radii.length >= 6)
    for (const value of radii) {
      assert.ok(['2px', '4px', '8px'].includes(value), value)
    }
    assert.ok(radii.includes('2px'))
  })

  it('draws every separator as one pixel', () => {
    const strip = blocksFor(new RegExp(`^\\.${dom.STRIP_CLASS}$`, 'u'))[0]
    assert.equal(declaration(strip.body, 'border-block-end'), '1px solid var(--dsh-trae-rule-l3)')
    const composer = blocksFor(/\[data-composer-card\]$/u)[0]
    assert.equal(declaration(composer.body, 'border'), '1px solid var(--dsh-trae-rule-l2) !important')
    const menu = blocksFor(/\[data-menu-material\]$/u)[0]
    assert.equal(declaration(menu.body, 'border'), '1px solid var(--dsh-trae-rule-l2) !important')
    // Every rule that draws a line does it at one pixel: a thicker separator is not
    // something the reference site has anywhere.
    for (const rule of RULES) {
      for (const property of ['border', 'border-block-end', 'border-block-start', 'border-inline-end', 'border-inline-start']) {
        const value = declaration(rule.body, property)
        if (value === undefined) continue
        assert.match(value, /^(1px|0)\b|^transparent/u, `${rule.selector} { ${property}: ${value} }`)
      }
    }
  })

  it('replaces all three elevation tiers with the reference’s own recipe', () => {
    const block = blocksFor(/^body\[data-dsh-trae\],\s*body\[data-dsh-trae\] \*$/u)[0]
    assert.ok(block !== undefined, 'the elevation tiers must be declared per element')
    assert.equal(declaration(block.body, '--dsw-elevation-panel'), 'var(--dsh-trae-elevation) !important')
    assert.equal(declaration(block.body, '--dsw-elevation-prominent'), 'var(--dsh-trae-elevation-prominent) !important')
    assert.equal(declaration(block.body, '--dsw-elevation-soft'), 'var(--dsh-trae-elevation-soft) !important')
  })

  it('spends the accent on the primary button and the near-black label on top of it', () => {
    const map = new Map([...CSS.matchAll(/(--dsw-[\w-]+)\s*:\s*([^;!]+)\s*!important/gu)].map(match => [match[1], match[2].trim()]))
    assert.equal(map.get('--dsw-alias-button-primary-fill'), 'var(--dsh-trae-accent)')
    assert.equal(map.get('--dsw-alias-label-primary-foreground'), 'var(--dsh-trae-on-accent)')
    assert.equal(map.get('--dsw-alias-button-primary-hover'), 'var(--dsh-trae-accent-hover)')
  })

  it('gives the focus ring a 1px neutral stroke and a 2px offset', () => {
    const map = new Map([...CSS.matchAll(/(--dsw-focus-ring-[\w-]+)\s*:\s*([^;!]+)/gu)].map(match => [match[1], match[2].trim()]))
    assert.equal(map.get('--dsw-focus-ring-width'), '1px')
    assert.equal(map.get('--dsw-focus-ring-color'), 'var(--dsh-trae-faint)')
    const offsets = blocksFor(/:focus-visible$/u)
    assert.equal(offsets.length, 1)
    assert.equal(declaration(offsets[0].body, 'outline-offset'), '2px')
    // The ring's colour and width travel through the product's own tokens, so a
    // control that deliberately paints no ring keeps painting none.
    assert.equal(declaration(offsets[0].body, 'outline'), undefined)
  })

  it('repaints both states of a switch from the skin’s own palette', () => {
    const on = blocksFor(/\[role='switch'\]\[aria-checked='true'\]$/u)[0]
    const off = blocksFor(/\[role='switch'\]\[aria-checked='false'\]$/u)[0]
    assert.equal(declaration(on.body, 'background'), 'var(--dsh-trae-accent) !important')
    assert.equal(declaration(off.body, 'background'), 'var(--dsh-trae-rule-l1) !important')
  })

  it('moves the composer circle’s glyph with the fill it repaints, and only that glyph', () => {
    // The product paints that glyph with a static white literal, so a skin that moves
    // the info fill without moving the glyph ships a 1.50:1 action button. The rule has
    // to be narrow enough to leave the card's three other glyphs alone.
    const rule = blocksFor(/\[data-composer-card\] button/u)[0]
    assert.ok(rule !== undefined, 'the composer circle needs its glyph moved')
    assert.equal(declaration(rule.body, 'color'), 'var(--dsh-trae-on-accent)')
    // Two conditions do the narrowing: an icon-only button, and one whose accessible
    // contract says it opens no popup. Both are attributes, not generated class names.
    assert.match(rule.selector, /button:has\(> svg:only-child\)/u)
    assert.match(rule.selector, /:not\(\[aria-haspopup\]\)/u)
    assert.ok(rule.selector.includes('body[data-dsh-trae]'))
  })

  it('never bolds code, because the reference has no bold mono face', () => {
    const block = blocksFor(/code,\s*body\[data-dsh-trae\] kbd/u)[0] ?? blocksFor(/code$/u)[0]
    assert.ok(block !== undefined)
    assert.equal(declaration(block.body, 'font-weight'), '400')
  })
})

describe('the band', () => {
  it('is a fixed row exactly as tall as the page is padded down', () => {
    const strip = blocksFor(new RegExp(`^\\.${dom.STRIP_CLASS}$`, 'u'))[0]
    assert.equal(declaration(strip.body, 'position'), 'fixed')
    assert.equal(declaration(strip.body, 'block-size'), `${STRIP_HEIGHT}px`)
    const mountBlock = blocksFor(/^body\[data-dsh-trae\] #root$/u)[0]
    assert.equal(declaration(mountBlock.body, 'padding-block-start'), `${STRIP_HEIGHT}px`)
  })

  it('closes the page back up when the band is off', () => {
    const off = blocksFor(/\[data-dsh-trae-strip='off'\] #root$/u)[0]
    assert.equal(declaration(off.body, 'padding-block-start'), '0')
  })

  it('keeps only its content in the bare shape', () => {
    const bare = blocksFor(/\[data-dsh-trae-strip='bare'\] \.dsh-trae-strip$/u)[0]
    assert.equal(declaration(bare.body, 'background'), 'transparent')
    assert.equal(declaration(bare.body, 'border-block-end-color'), 'transparent')
  })

  it('declares its own drag region, because the shell subtracts body children', () => {
    const strip = blocksFor(new RegExp(`^\\.${dom.STRIP_CLASS}$`, 'u'))[0]
    assert.equal(declaration(strip.body, '-webkit-app-region'), 'drag !important')
  })

  it('clips the wordmark out of the full ramp and paints the plate at 16%', () => {
    const mark = blocksFor(new RegExp(`^\\.${dom.MARK_CLASS}$`, 'u'))[0]
    assert.equal(declaration(mark.body, 'background-clip'), 'text')
    assert.match(declaration(mark.body, '-webkit-text-fill-color'), /transparent/u)
    const plate = blocksFor(new RegExp(`^\\.${dom.PLATE_CLASS}$`, 'u'))[0]
    assert.equal(declaration(plate.body, 'background'), 'var(--dsh-trae-gradient-plate)')
  })

  it('draws the idle light as a ring', () => {
    const lamp = blocksFor(new RegExp(`^\\.${dom.LAMP_CLASS}$`, 'u'))[0]
    assert.equal(declaration(lamp.body, 'background'), 'transparent')
    assert.equal(declaration(lamp.body, 'border'), '1px solid var(--dsh-trae-accent-text)')
    assert.equal(declaration(lamp.body, 'inline-size'), `${LIGHT_RADIUS * 2}px`)
  })

  it('fills the light on the composer’s focus and on the pointer, as three separate rules', () => {
    const fills = blocksFor(/\.dsh-trae-strip-lamp$/u)
      .filter(block => block.selector.includes(':hover') || block.selector.includes(':has('))
    assert.equal(fills.length, 3, fills.map(block => block.selector).join(' | '))
    // One selector list would be dropped whole by an engine without :has(), taking
    // the band's own hover down with it.
    const bandHover = fills.find(block => block.selector.includes(`.${dom.STRIP_CLASS}:hover`))
    assert.ok(bandHover !== undefined)
    const hasRules = fills.filter(block => block.selector.includes(':has('))
    assert.equal(hasRules.length, 2)
    for (const block of hasRules) {
      assert.ok(block.selector.includes('data-composer-card'), block.selector)
    }
  })

  it('breathes on the two readings that ask for it, and not on idle', () => {
    const breathing = RULES.filter(rule => rule.body.includes('animation: dsh-trae-breathe'))
    assert.equal(breathing.length, 1)
    const selector = breathing[0].selector
    assert.ok(selector.includes("data-dsh-trae-activity='running'"), selector)
    assert.ok(selector.includes("data-dsh-trae-activity='unknown'"), selector)
    assert.ok(!selector.includes("data-dsh-trae-activity='idle'"), selector)
    assert.ok(selector.includes("data-dsh-trae-pulse='on'"), selector)
  })

  it('spreads the glow by the radius and the configured multiple', () => {
    const keyframes = /@keyframes dsh-trae-breathe\s*\{([\s\S]*?)\n\}/u.exec(CSS)
    assert.ok(keyframes !== null)
    assert.ok(keyframes[1].includes(`calc(${LIGHT_RADIUS}px * var(--dsh-trae-pulse-scale))`))
    assert.ok(keyframes[1].includes('var(--dsh-trae-pulse-color)'))
    assert.ok(keyframes[1].includes('var(--dsh-trae-pulse-opacity)'))
  })

  it('fades in place over the same period under reduced motion', () => {
    const still = /@keyframes dsh-trae-breathe-still\s*\{([\s\S]*?)\n\}/u.exec(CODE)
    assert.ok(still !== null)
    // Opacity only: no travel, and no second duration.
    assert.ok(!still[1].includes('box-shadow'))
    assert.ok(!still[1].includes('transform'))
    const reduced = RULES.filter(rule => rule.media?.includes('prefers-reduced-motion') === true)
    assert.ok(reduced.length >= 3, `only ${reduced.length} reduced-motion rules`)
    const switched = reduced.find(rule => rule.selector.includes('data-dsh-trae-activity'))
    assert.ok(switched !== undefined)
    assert.equal(declaration(switched.body, 'animation-name'), 'dsh-trae-breathe-still')
    assert.equal(declaration(switched.body, 'animation-duration'), undefined)
  })

  it('keeps the light’s own state readable without painting it', () => {
    const state = blocksFor(new RegExp(`^\\.${dom.STATE_CLASS}$`, 'u'))[0]
    assert.equal(declaration(state.body, 'position'), 'absolute')
    assert.equal(declaration(state.body, 'clip-path'), 'inset(50%)')
    assert.equal(declaration(state.body, 'block-size'), '1px')
  })
})

describe('the things the reference never uses', () => {
  it('has no radial gradient and no glow', () => {
    assert.ok(!CSS.includes('radial-gradient'))
  })

  it('has no backdrop filter', () => {
    assert.ok(!CSS.includes('backdrop-filter'))
  })

  it('has no blend mode', () => {
    assert.ok(!CSS.includes('mix-blend-mode'))
  })

  it('has no blur and no noise texture', () => {
    assert.ok(!/filter:\s*blur/u.test(CSS))
    assert.ok(!CSS.includes('noise'))
    assert.ok(!/url\(/u.test(CSS), 'the skin ships no asset')
  })
})

describe('the tokens the skin must not touch', () => {
  it('leaves the state, notice, diff and syntax colours to the product', () => {
    for (const fragment of ['state-warn', 'state-success', 'state-error', 'toast-bg', 'toast-label', 'tooltip-bg', 'code-diff', 'file-diff', 'shiki']) {
      assert.ok(!CSS.includes(fragment), fragment)
    }
  })

  it('leaves the one inverted-label token alone', () => {
    assert.ok(!CSS.includes('label-primary-inverted'))
  })
})

describe('the selectors it is allowed to use', () => {
  it('addresses the product through its documented hooks and its accessible contracts', () => {
    assert.ok(CSS.includes(`[${dom.COMPOSER_ATTRIBUTE}]`))
    assert.ok(CSS.includes(`[${dom.MENU_ATTRIBUTE}]`))
    assert.ok(CSS.includes("[role='switch'][aria-checked='true']"))
    assert.ok(CSS.includes('body[data-dsh-trae] #root'))
    // Every attribute this sheet selects on, so a new one cannot slip in unnoticed.
    const attributes = [...new Set([...CODE.matchAll(/\[([\w-]+)/gu)].map(match => match[1]))].sort()
    assert.deepEqual(attributes, [
      'aria-checked', 'aria-haspopup', 'data-composer-card', 'data-dsh-trae',
      'data-dsh-trae-activity', 'data-dsh-trae-pulse', 'data-dsh-trae-scheme',
      'data-dsh-trae-strip', 'data-menu-material', 'role',
    ])
  })

  it('depends on no generated class name', () => {
    // A CSS-module class is hashed: a bare word followed by a long mixed-case or
    // digit-bearing run, or the `css.` accessor form.
    assert.ok(!/css\.[a-zA-Z]/u.test(CODE))
    const classes = [...CODE.matchAll(/(?<![\d\w.])\.([\w-]+)/gu)].map(match => match[1])
    for (const name of classes) {
      assert.match(name, /^dsh-trae-[\w-]+$/u, `class "${name}" is not this plugin's own`)
    }
  })

  it('uses no structural pseudo-class that a re-render could break', () => {
    for (const fragment of [':nth-child', ':nth-of-type', ':first-child', ':last-child', '>div', '#root >']) {
      assert.ok(!CSS.includes(fragment), fragment)
    }
  })
})

describe('installPageStyles', () => {
  it('installs once, then hands the element back on dispose', () => {
    const doc = createFakeDocument()
    const dispose = styles.installPageStyles(doc)
    assert.equal(doc.head.children.length, 1)
    assert.equal(doc.head.children[0].id, dom.STYLE_ID)
    assert.equal(doc.head.children[0].textContent, CSS)
    // A second install is a no-op rather than a second copy of the sheet.
    const second = styles.installPageStyles(doc)
    assert.equal(doc.head.children.length, 1)
    second()
    assert.equal(doc.head.children.length, 1)
    dispose()
    assert.equal(doc.head.children.length, 0)
  })
})

describe('the card’s stylesheet', () => {
  const PANEL = panelStyles.panelStyles()

  it('is scoped to this plugin’s own card', () => {
    const [root] = rulesOf(PANEL)
    assert.equal(root.selector, '[data-plugin-config="dsh-trae-skin"]')
    assert.equal(declaration(root.body, 'display'), 'flex')
    for (const rule of rulesOf(PANEL)) {
      assert.ok(
        rule.selector.startsWith('[data-plugin-config="dsh-trae-skin"]'),
        `the card’s sheet must not reach outside its own root: ${rule.selector}`,
      )
    }
  })

  it('styles itself from the product’s tokens, not from the skin’s palette', () => {
    assert.ok(PANEL.includes('var(--dsw-alias-'))
    assert.ok(!PANEL.includes('var(--dsh-trae-page)'))
  })

  it('speaks the sibling card’s layout language, so the two read as one series', () => {
    const rules = rulesOf(PANEL)
    // `includes`, not `endsWith`: a rule may carry a selector list.
    const body = selector => rules.find(rule => rule.selector.includes(selector))?.body ?? ''
    // The sibling skin's card measurements, kept deliberately identical: the note's
    // own surface and radius, an 84px label column, 6px controls inside it.
    assert.equal(declaration(body('.dshTraeNote'), 'border-radius'), '8px')
    assert.equal(declaration(body('.dshTraeNote'), 'background'), 'var(--dsw-alias-bg-layer-2, #f4f5f7)')
    assert.equal(declaration(body('.dshTraeField'), 'grid-template-columns'), '84px 1fr')
    assert.equal(declaration(body('.dshTraeGrid'), 'grid-template-columns'), 'repeat(auto-fit, minmax(360px, 1fr))')
    assert.equal(declaration(body('.dshTraeField select'), 'border-radius'), '6px')
    assert.equal(declaration(body('.dshTraeFieldHint'), 'font-size'), '11.5px')
    assert.equal(declaration(body('.dshTraePreview'), 'display'), 'flex')
    assert.equal(declaration(body('.dshTraeToggle'), 'display'), 'flex')
    assert.equal(declaration(body('.dshTraeFoot'), 'display'), 'flex')
    assert.equal(declaration(body('.dshTraeStatus'), 'font-size'), '11.5px')
  })

  it('keeps the card’s own radii on the series’ scale rather than the page’s', () => {
    // The skinned page uses the reference site's 2 / 4 / 8px; the card around the
    // settings borrows the sibling card's chrome instead, which is what makes the two
    // plugins' cards look like one family.
    const radii = [...PANEL.matchAll(/border-radius:\s*([^;]+);/gu)].map(match => match[1].trim())
    assert.ok(radii.length >= 5)
    for (const value of radii) {
      assert.ok(['2px', '4px', '6px', '8px'].includes(value), value)
    }
    assert.ok(radii.includes('6px') && radii.includes('8px'))
  })

  it('keeps the readout in the code face and its heading in the label weight', () => {
    const rules = rulesOf(PANEL)
    const pair = rules.find(rule => rule.selector.endsWith('.dshTraePreviewPair code'))
    assert.equal(declaration(pair.body, 'font-family'), 'var(--ds-font-family-code, monospace)')
    const title = rules.find(rule => rule.selector.endsWith('.dshTraeDerivedTitle'))
    assert.equal(declaration(title.body, 'font-weight'), '500')
  })

  it('gives the breathing block the note’s own surface, so it reads as a block', () => {
    const rules = rulesOf(PANEL)
    const group = rules.find(rule => rule.selector.endsWith('.dshTraeGroup'))
    assert.equal(declaration(group.body, 'border-radius'), '8px')
    assert.equal(declaration(group.body, 'background'), 'var(--dsw-alias-bg-layer-2, #f4f5f7)')
    assert.equal(declaration(group.body, 'border'), '0')
  })

  it('installs once per page, tagged with its own attribute', () => {
    const doc = createFakeDocument()
    const dispose = panelStyles.installPanelStyles(doc)
    assert.equal(doc.head.children.length, 1)
    assert.equal(doc.head.children[0].hasAttribute(dom.PANEL_STYLE_ATTRIBUTE), true)
    panelStyles.installPanelStyles(doc)
    assert.equal(doc.head.children.length, 1)
    dispose()
    assert.equal(doc.head.children.length, 0)
  })
})
