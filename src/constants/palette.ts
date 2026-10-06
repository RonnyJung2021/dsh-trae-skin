/**
 * The Trae palette, read off the reference site's own stylesheets.
 *
 * `trae.cn` ships two token layers, and this skin takes one value from each where
 * they disagree. Every literal below is one the site declares:
 *
 * - **The page layer** — a bare `:root` applied to `<html>` with no theme
 *   attribute — is what a visitor actually sees, so the dark shell is that layer
 *   unmodified: `--bg-bg-base-default:#0a0b0d`, `--bg-bg-base-secondary:#121314`,
 *   `--bg-bg-overlay-l1…l4:#edeff20a/#edeff214/#edeff221/#edeff22e`,
 *   `--border-border-neutral-l1…l3:#ffffff0f/#ffffff1f/#ffffff2e`,
 *   `--text-text-default:#f5f9fe`, `--text-text-secondary:#a6aab5`,
 *   `--text-text-tertiary:#787d87`, `--text-text-onbrand:#0a0b0d`,
 *   `--bg-bg-invert:#edeff2`.
 * - **The product layer** — `.solo-theme[data-theme=light]`, 128 properties for
 *   the IDE surfaces — is the only light block the site has, so the light shell is
 *   taken from it: `base:#fff`, `card:#fafafa`, `text-default:#1a1a1a`,
 *   `text-secondary:#5b6066`, `borders:#4d6b991f/#4d6b992e/#4d6b995c`,
 *   `overlays:#5663770f/#5663771a/#56637724/#56637733`, `onbrand:#0c0c0d`.
 *
 * Two things the reference does **not** have, which the skin therefore also does
 * not have, because adding them would be a different site's look: no
 * `radial-gradient`, no `filter: blur()`, no `mix-blend-mode` and no noise texture
 * anywhere in its stylesheets. Its depth is flat — a near-black page, 6–18% white
 * hairlines, and a 0.5px inner highlight over one soft drop. The signature
 * flourish is the mint gradient, which the site uses as `background-clip: text`.
 *
 * The gradient is **derived rather than transcribed** for a custom accent:
 * {@link GRADIENT_RHYTHM} holds the hue/saturation/lightness offsets the
 * reference's own four stops sit at relative to its brand colour, so any accent
 * gets a ramp with the same rhythm. The reference's own stops are used verbatim
 * for the reference's own accent, in each shell separately — the dark ramp's mint
 * end is invisible on a white page, so the light shell has its own four values.
 */

import { LIGHT_RADIUS, STRIP_HEIGHT } from './config.ts'
import type { HslOffset } from '../types/color.ts'
import type { ShellId, TextDirection } from '../enums/shell.ts'

/** One Trae shell: the reference's own near-black page, or its light counterpart. */
export interface TraeShell {
  /** Identifier this shell is published under. */
  readonly id: ShellId
  /** Page background. `--bg-bg-base-default` / the light block's `base`. */
  readonly page: string
  /** Nested fill, one step off the page. `--bg-bg-base-secondary` / light `card`. */
  readonly raised: string
  /**
   * Third surface: the page colour lifted once, for menus and banners.
   *
   * Derived rather than transcribed — the reference states it as
   * `--bg-bg-overlay-l1` over `--bg-bg-base-secondary`, which is `#1c1c1d` on the
   * near-black page; the light shell's own third step is its `base`.
   */
  readonly terrace: string
  /** Body text. `--text-text-default`. */
  readonly ink: string
  /** Secondary text. `--text-text-secondary`. */
  readonly muted: string
  /** Tertiary text. `--text-text-tertiary`. */
  readonly faint: string
  /** Faintest hairline: the reference's 6% white / 12% slate step. */
  readonly ruleL1: string
  /** Middle hairline, the one cards and inputs carry. */
  readonly ruleL2: string
  /** Strongest hairline, the one between page regions. */
  readonly ruleL3: string
  /** Ink wash for hover on quiet surfaces: `--bg-bg-overlay-l1`. */
  readonly overlayL1: string
  /** The step above it: `--bg-bg-overlay-l2`. */
  readonly overlayL2: string
  /** The pressed/selected step: `--bg-bg-overlay-l3`. */
  readonly overlayL3: string
  /** The heaviest wash, for rows held down: `--bg-bg-overlay-l4`. */
  readonly overlayL4: string
  /** Fill of the reference's inverted button: `--bg-bg-invert`. */
  readonly invert: string
  /** Its hover step. */
  readonly invertHover: string
  /** Its pressed step. */
  readonly invertActive: string
  /** Label on top of an accent fill: `--text-text-onbrand`. */
  readonly onAccent: string
  /** Which way to move the accent until it can carry text on {@link page}. */
  readonly textDirection: TextDirection
  /** Scrollbar thumb at rest: the reference's own pair. */
  readonly scrollThumb: string
  /** Scrollbar thumb under the pointer. */
  readonly scrollThumbHover: string
  /** The colour the product draws its 0.5px elevation stroke with. */
  readonly elevationStroke: string
  /** The reference's floating recipe: 0.5px inner highlight plus one soft drop. */
  readonly elevation: string
  /** The composer's lighter tier of the same recipe. */
  readonly elevationSoft: string
  /** The heaviest tier, for dialogs: the reference's own `0 16px 32px` spread. */
  readonly elevationProminent: string
  /** One soft drop on its own, for surfaces that carry no highlight. */
  readonly shadowLv1: string
  /** The same drop with a wider blur, for the product's second shadow step. */
  readonly shadowLv1Blur: string
  /** The reference's heaviest drop, on its own. */
  readonly shadowLv3: string
  /**
   * The reference's own four brand stops, used verbatim for its own accent.
   * @remarks Any other accent derives its ramp from {@link GRADIENT_RHYTHM}.
   */
  readonly gradientStops: readonly string[]
}

/** The reference's own page: near-black paper, mint ink, 6–18% white hairlines. */
export const DARK_SHELL: TraeShell = {
  id: 'dark',
  page: '#0a0b0d',
  raised: '#121314',
  terrace: '#1c1c1d',
  ink: '#f5f9fe',
  muted: '#a6aab5',
  faint: '#787d87',
  ruleL1: '#ffffff0f',
  ruleL2: '#ffffff1f',
  ruleL3: '#ffffff2e',
  overlayL1: '#edeff20a',
  overlayL2: '#edeff214',
  overlayL3: '#edeff221',
  overlayL4: '#edeff22e',
  invert: '#edeff2',
  invertHover: '#ffffff',
  invertActive: '#0b0b0a',
  onAccent: '#0a0b0d',
  textDirection: 'lighten',
  // `--bg-bg-overlay-l4` and `--border-border-neutral-l3`, the site's own pair.
  scrollThumb: '#edeff22e',
  scrollThumbHover: '#ffffff2e',
  elevationStroke: '#ffffff2e',
  // `--shadow-elevation` on the site's activity cards and menu surfaces.
  elevation: 'inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 4px 8px 0 rgb(0 0 0 / 30%)',
  elevationSoft: 'inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 2px 8px 0 rgb(0 0 0 / 32%)',
  elevationProminent: 'inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 16px 32px 0 rgb(0 0 0 / 40%)',
  shadowLv1: '0 2px 8px 0 rgb(0 0 0 / 32%)',
  shadowLv1Blur: '0 4px 12px 0 rgb(0 0 0 / 32%)',
  shadowLv3: '0 16px 32px 0 rgb(0 0 0 / 40%)',
  gradientStops: ['#3ee1a3', '#32f08c', '#60f2bd', '#a0fde7'],
}

/**
 * The light shell, from the light block of the design system the site ships.
 *
 * **Three values are corrected, because the site's own light block does not clear
 * AA on a white page** — the same defect the skin's sibling plugins correct for
 * their own references. The deviations are named, not silent:
 *
 * | Role | Reference light | Here | Why |
 * | --- | --- | --- | --- |
 * | tertiary text | `#8a9096` | `#6f757b` | 3.23:1 on white → 4.66:1, so captions pass AA |
 * | brand fill | `#0fdc78` | `#0a9c52` | 1.82:1 against white → 3.57:1, so the button reads as a shape at all (WCAG 1.4.11 asks 3:1) |
 * | every gradient stop | `#0ac27b #0ecd70 #06c179 #63c5b1` | `#078856 #09874a #048755 #408073` | 2.07–2.36:1 → 4.50–4.61:1; the wordmark is rendered *as text* (`background-clip: text`), and the whole point of a second ramp is that the dark one is invisible on white |
 *
 * The gradient correction keeps each stop's hue exactly (157° / 151° / 157° / 168°)
 * and moves only its lightness, so the light shell's ramp is still the reference's
 * own ramp — read on a page it was not authored for.
 */
export const LIGHT_SHELL: TraeShell = {
  id: 'light',
  page: '#ffffff',
  raised: '#fafafa',
  terrace: '#ffffff',
  ink: '#1a1a1a',
  muted: '#5b6066',
  faint: '#6f757b',
  ruleL1: '#4d6b991f',
  ruleL2: '#4d6b992e',
  ruleL3: '#4d6b995c',
  overlayL1: '#5663770f',
  overlayL2: '#5663771a',
  overlayL3: '#56637724',
  overlayL4: '#56637733',
  invert: '#36393d',
  invertHover: '#585b5f',
  invertActive: '#1a1b1d',
  onAccent: '#0c0c0d',
  textDirection: 'darken',
  scrollThumb: '#56637733',
  scrollThumbHover: '#4d6b995c',
  elevationStroke: '#4d6b995c',
  // The reference keeps its dark recipe here, where a white highlight does
  // nothing; the corrected weight swaps it for a 4% black one and a lighter drop.
  elevation: 'inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 4px 8px 0 rgb(0 0 0 / 12%)',
  elevationSoft: 'inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 2px 8px 0 rgb(0 0 0 / 8%)',
  elevationProminent: 'inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 16px 32px 0 rgb(0 0 0 / 12%)',
  shadowLv1: '0 2px 8px 0 rgb(0 0 0 / 8%)',
  shadowLv1Blur: '0 4px 12px 0 rgb(0 0 0 / 8%)',
  shadowLv3: '0 16px 32px 0 rgb(0 0 0 / 8%)',
  gradientStops: ['#078856', '#09874a', '#048755', '#408073'],
}

/** Both shells, keyed by the id the applier writes onto the body. */
export const SHELLS: Readonly<Record<ShellId, TraeShell>> = { dark: DARK_SHELL, light: LIGHT_SHELL }

/** One stop's offset from the accent, in HSL degrees and percentage points. */
export type GradientOffset = HslOffset

/**
 * The rhythm a custom accent's four gradient stops are derived at.
 *
 * Measured off the reference's own ramps — each shell's four stops expressed as
 * offsets from that shell's brand colour — so a user-supplied accent gets a ramp
 * the reference site could have authored rather than a mechanical tint.
 */
export const GRADIENT_RHYTHM: Readonly<Record<ShellId, readonly GradientOffset[]>> = {
  // Measured off #3ee1a3 / #32f08c / #60f2bd / #a0fde7.
  dark: [
    { dh: 8.8, ds: -13.3, dl: -0.6 },
    { dh: 0, ds: 0, dl: 0 },
    { dh: 9.8, ds: -1.5, dl: 9.4 },
    { dh: 17.4, ds: 9.5, dl: 24.1 },
  ],
  // Measured off #0ac27b / #0ecd70 / #06c179 / #63c5b1.
  light: [
    { dh: 6.1, ds: 3, dl: -2.9 },
    { dh: 0, ds: 0, dl: 0 },
    { dh: 6.1, ds: 6.8, dl: -3.9 },
    { dh: 17, ds: -41.4, dl: 15.1 },
  ],
}

/**
 * Where each gradient stop sits along the ramp.
 *
 * The reference states these four positions on its own brand gradient; the skin
 * keeps them for every accent so the shape of the ramp is the reference's, not the
 * accent's.
 */
export const GRADIENT_POSITIONS = ['0', '36%', '71.63%', '100%'] as const

/** How much of the gradient shows through the plate behind the wordmark. */
export const PLATE_ALPHA = 0.16

/** The informational wash, as the reference states its own brand popup: 12%. */
export const WASH_ALPHA = 0.12

/** How far the hover step darkens the accent. */
export const HOVER_DARKEN = 0.18

/** Alpha of the accent on a disabled primary button. */
export const DISABLED_ALPHA = 0.3

/**
 * The three faces, none of them shipped as a file.
 *
 * The reference sets `--font-family-default: "Inter"` and self-hosts three weights
 * of it. Inter is not installed on every machine, so the stacks name the platform
 * faces first — the reference's own CJK handling is a defect worth not copying,
 * since its only CJK-aware stack is the cashier's.
 */
export const FONT_STACKS = {
  /** Interface text: platform face first, Inter as the reference's own first fallback. */
  ui: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  /** Headings: the reference's `--font-family-heading`, an SF Pro Display-first stack. */
  display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  /** Wordmark and code: the reference's `--font-family-mono`, JetBrains Mono first. */
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
} as const

/**
 * The per-shell custom properties, field by field.
 *
 * One table, because two places have to agree on the names: the stylesheet that
 * declares them, and the applier that clears them on the way out.
 */
export const SHELL_VARIABLES: Readonly<Record<string, string>> = {
  page: '--dsh-trae-page',
  raised: '--dsh-trae-raised',
  terrace: '--dsh-trae-terrace',
  ink: '--dsh-trae-ink',
  muted: '--dsh-trae-muted',
  faint: '--dsh-trae-faint',
  ruleL1: '--dsh-trae-rule-l1',
  ruleL2: '--dsh-trae-rule-l2',
  ruleL3: '--dsh-trae-rule-l3',
  overlayL1: '--dsh-trae-overlay-l1',
  overlayL2: '--dsh-trae-overlay-l2',
  overlayL3: '--dsh-trae-overlay-l3',
  overlayL4: '--dsh-trae-overlay-l4',
  invert: '--dsh-trae-invert',
  invertHover: '--dsh-trae-invert-hover',
  invertActive: '--dsh-trae-invert-active',
  onAccent: '--dsh-trae-on-accent',
  scrollThumb: '--dsh-trae-scroll-thumb',
  scrollThumbHover: '--dsh-trae-scroll-thumb-hover',
  elevationStroke: '--dsh-trae-elevation-stroke',
  elevation: '--dsh-trae-elevation',
  elevationSoft: '--dsh-trae-elevation-soft',
  elevationProminent: '--dsh-trae-elevation-prominent',
  shadowLv1: '--dsh-trae-shadow-lv1',
  shadowLv1Blur: '--dsh-trae-shadow-lv1-blur',
  shadowLv3: '--dsh-trae-shadow-lv3',
}

/**
 * The custom properties the applier writes by hand, in the order it writes them.
 *
 * The shells' own values are declared in the stylesheet; what travels through
 * here is the half a setting can move — the accent's derivations and the light's
 * breathing — so disposal knows exactly which names to hand back.
 */
export const DYNAMIC_VARIABLES = [
  '--dsh-trae-accent',
  '--dsh-trae-accent-hover',
  '--dsh-trae-accent-disabled',
  '--dsh-trae-accent-text',
  '--dsh-trae-accent-wash',
  '--dsh-trae-gradient',
  '--dsh-trae-gradient-plate',
  '--dsh-trae-pulse-color',
  '--dsh-trae-pulse-scale',
  '--dsh-trae-pulse-period',
  '--dsh-trae-pulse-opacity',
] as const

/**
 * Product tokens this skin repoints, and the skin variable each one reads.
 *
 * Deliberately **not** here, because DSH already switches them on
 * `body[data-ds-dark-theme]` and pinning them would flatten both shells onto one
 * set of values: the state colours (warn / success / error), the toast and tooltip
 * surfaces, the coloured diff backgrounds, and the syntax palette.
 *
 * `--dsw-alias-label-primary-inverted` is the one token the skin is built never to
 * touch: every place the product spends it is a label on a dark surface, and its
 * own light value is what those places want.
 */
export const ALIAS_MAP: readonly (readonly [string, string])[] = [
  // Grounds.
  ['--dsw-alias-bg-base', 'var(--dsh-trae-page)'],
  ['--dsw-alias-bg-layer-1', 'var(--dsh-trae-page)'],
  ['--dsw-alias-bg-layer-2', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-bg-layer-3', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-bg-overlay', 'var(--dsh-trae-page)'],
  ['--dsw-alias-bg-module-platform', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-bg-multi-select', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-bg-skeleton', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-bg-document-preview', 'var(--dsh-trae-raised)'],
  ['--dsw-specific-sidebar-fill', 'var(--dsh-trae-page)'],
  ['--dsw-specific-input-major', 'var(--dsh-trae-page)'],
  ['--dsw-specific-bubble', 'var(--dsh-trae-raised)'],
  ['--dsw-specific-selector', 'var(--dsh-trae-raised)'],
  ['--dsw-specific-tip', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-specific-login-input', 'var(--dsh-trae-page)'],
  ['--dsw-specific-bubble-highlight', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-specific-sidebar-nav-item-hover', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-specific-sidebar-nav-item-active', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-specific-sidebar-nav-item-active-accent', 'var(--dsh-trae-accent-text)'],

  // Floating surfaces. The reference paints its menus with the page colour and a
  // 1px third-step hairline, which is also what keeps the product's own translucent
  // blur invisible: an opaque fill over it leaves nothing to blur.
  ['--dsw-menu-surface-fill', 'var(--dsh-trae-page)'],
  ['--dsw-specific-menu', 'var(--dsh-trae-page)'],
  ['--dsw-alias-menu-group-header-fill', 'var(--dsh-trae-page)'],
  ['--dsw-alias-menu-icon', 'var(--dsh-trae-muted)'],
  ['--dsw-alias-settings-card-fill', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-settings-card-stroke', 'var(--dsh-trae-rule-l1)'],

  // Markdown and code surfaces.
  ['--dsw-alias-markdown-code-block', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-markdown-code-block-banner', 'var(--dsh-trae-terrace)'],
  ['--dsw-alias-markdown-code-segment-selected', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-markdown-code-segment-unselected', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-markdown-inline-code', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-alias-markdown-tag', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-alias-markdown-citation', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-alias-markdown-placeholder', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-turn-trigger-bg', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-turn-trigger-bg-hover', 'var(--dsh-trae-overlay-l2)'],

  // Rules. The reference draws every separator as 1px at one of three alphas.
  ['--dsw-alias-border-l1', 'var(--dsh-trae-rule-l1)'],
  ['--dsw-alias-border-l2', 'var(--dsh-trae-rule-l2)'],
  ['--dsw-alias-border-l2-darkmode-thin', 'var(--dsh-trae-rule-l1)'],
  ['--dsw-alias-border-l3', 'var(--dsh-trae-rule-l3)'],
  ['--dsw-alias-border-l4', 'var(--dsh-trae-rule-l3)'],

  // Ink.
  ['--dsw-alias-label-primary', 'var(--dsh-trae-ink)'],
  ['--dsw-alias-label-primary-dimmed', 'var(--dsh-trae-ink)'],
  ['--dsw-alias-label-primary-bluish', 'var(--dsh-trae-ink)'],
  ['--dsw-alias-label-primary-foreground', 'var(--dsh-trae-on-accent)'],
  ['--dsw-alias-label-secondary', 'var(--dsh-trae-muted)'],
  ['--dsw-alias-label-tertiary', 'var(--dsh-trae-faint)'],
  ['--dsw-alias-label-caption', 'var(--dsh-trae-faint)'],
  ['--dsw-alias-label-dimmed', 'var(--dsh-trae-faint)'],
  ['--dsw-alias-label-document-preview', 'var(--dsh-trae-muted)'],

  // The accent, spent the way the reference spends it: its primary call to action
  // is a mint fill with a near-black label, so the fill and the label on it move as
  // one pair.
  ['--dsw-alias-brand-primary', 'var(--dsh-trae-accent)'],
  ['--dsw-alias-brand-primary-new-colorprimary-new-color', 'var(--dsh-trae-accent)'],
  ['--dsw-alias-brand-text', 'var(--dsh-trae-accent-text)'],
  ['--dsw-alias-link', 'var(--dsh-trae-accent-text)'],
  ['--dsw-alias-button-primary-fill', 'var(--dsh-trae-accent)'],
  ['--dsw-alias-button-primary-hover', 'var(--dsh-trae-accent-hover)'],
  ['--dsw-alias-button-primary-dimmed', 'var(--dsh-trae-accent-disabled)'],
  ['--dsw-alias-button-info-fill', 'var(--dsh-trae-accent)'],
  ['--dsw-alias-button-info-hover', 'var(--dsh-trae-accent-hover)'],
  ['--dsw-alias-state-business-primary', 'var(--dsh-trae-accent)'],
  ['--dsw-alias-state-business-tertiary', 'var(--dsh-trae-accent-wash)'],

  // The reference's other two button weights: an inverted fill, and quiet ones
  // that answer the pointer with an ink wash.
  ['--dsw-alias-button-contrast-fill', 'var(--dsh-trae-invert)'],
  ['--dsw-alias-button-elevated-fill', 'var(--dsh-trae-page)'],
  ['--dsw-alias-button-floating-fill', 'var(--dsh-trae-raised)'],
  ['--dsw-alias-button-floating-hover', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-button-ghost-active-fill', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-alias-button-ghost-active-hover', 'var(--dsh-trae-overlay-l3)'],
  ['--dsw-alias-button-ghost-active-border', 'var(--dsh-trae-rule-l2)'],
  ['--dsw-alias-interactive-bg-hover', 'var(--dsh-trae-overlay-l1)'],
  ['--dsw-alias-interactive-bg-active', 'var(--dsh-trae-overlay-l3)'],
  ['--dsw-alias-interactive-bg-hover-solid', 'var(--dsh-trae-overlay-l2)'],
  ['--dsw-alias-interactive-bg-hover-accent', 'var(--dsh-trae-accent-wash)'],

  // Scrollbars: the reference's own two-step thumb, per shell.
  ['--dsw-alias-scrollbar-bg-l1', 'var(--dsh-trae-scroll-thumb)'],
  ['--dsw-alias-scrollbar-bg-l2', 'var(--dsh-trae-scroll-thumb)'],
  ['--dsw-alias-scrollbar-hover-l1', 'var(--dsh-trae-scroll-thumb-hover)'],
  ['--dsw-alias-scrollbar-hover-l2', 'var(--dsh-trae-scroll-thumb-hover)'],

  // Depth: the reference's own recipes, top to bottom.
  ['--dsw-elevation-stroke-color', 'var(--dsh-trae-elevation-stroke)'],
  ['--dsw-shadow-lv1', 'var(--dsh-trae-shadow-lv1)'],
  ['--dsw-shadow-lv1-blur', 'var(--dsh-trae-shadow-lv1-blur)'],
  ['--dsw-shadow-lv2', 'var(--dsh-trae-elevation)'],
  ['--dsw-shadow-lv3', 'var(--dsh-trae-shadow-lv3)'],
  ['--dsw-linear-gradient-think', 'var(--dsh-trae-think)'],
  ['--dsw-linear-think-select', 'var(--dsh-trae-think-select)'],
]

/**
 * The three faces as custom properties.
 *
 * Declared once, because a face is a property of the skin rather than of a shell:
 * the near-black page and the white one are read in the same type.
 */
export const FONT_VARIABLES: readonly (readonly [string, string])[] = [
  ['--dsh-trae-font-ui', FONT_STACKS.ui],
  ['--dsh-trae-font-display', FONT_STACKS.display],
  ['--dsh-trae-font-mono', FONT_STACKS.mono],
]

/**
 * Type, corners and focus: the same in both shells.
 *
 * The radius scale lands on the reference's three steps — `2px` is its main value
 * and `6 / 10 / 12 / 16 / 20 / 28` are the product's, none of which the reference
 * uses. The focus ring is a 1px neutral stroke, never the brand colour: the brand
 * is reserved for state.
 */
export const CHROME_VARIABLES: readonly (readonly [string, string])[] = [
  ['--dsw-radius-xs', '2px'],
  ['--dsw-radius-sm', '4px'],
  ['--dsw-radius-md', '4px'],
  ['--dsw-radius-lg', '8px'],
  ['--dsw-radius-xl', '8px'],
  ['--dsw-radius-panel', '8px'],
  ['--dsw-font-family', 'var(--dsh-trae-font-ui)'],
  ['--dsw-font-family-brand', 'var(--dsh-trae-font-display)'],
  ['--ds-font-family-code', 'var(--dsh-trae-font-mono)'],
  ['--dsw-focus-ring-width', '1px'],
  ['--dsw-focus-ring-color', 'var(--dsh-trae-faint)'],
]

/**
 * The lengths the stylesheet writes as plain values.
 *
 * The band's height and the light's radius are compiled constants rather than
 * settings — the wordmark's face and the glow's travel are both derived from them
 * — so they are re-exported here for the stylesheet and the tests to read from one
 * place.
 */
export { LIGHT_RADIUS, STRIP_HEIGHT }
