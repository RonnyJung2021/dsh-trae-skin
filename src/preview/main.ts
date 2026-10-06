/**
 * The self-test preview: the real modules on a mock shell.
 *
 * This is not a replica of the product. It is the same stylesheet, the same
 * applier, the same status band and the same reading of the streaming signal,
 * mounted on a page that carries the product's own token names and a handful of its
 * documented hooks — enough to see the palette, switch shells, change the accent and
 * check the derivation without an engine, a profile or a login.
 *
 * It is built to `lib/preview.js` and opened from `preview/index.html`, so it runs
 * from the file system with no server. Everything it renders comes from `src/`; the
 * only thing the page around it adds is the mock shell.
 */

import type { Activity } from '../enums/activity.ts'
import type { TraeScheme } from '../enums/scheme.ts'
import type { TraeSkinInput } from '../types/palette.ts'
import { accentsFor, gradientCss } from '../utils/accent.ts'
import { formatRatio } from '../utils/color.ts'
import { DARK_SHELL, LIGHT_SHELL } from '../constants/palette.ts'
import { observeActivity } from '../client/activity.ts'
import { stripCopy } from '../client/copy.ts'
import { createSkin } from '../client/skin.ts'
import { createStatusBand, type StatusBand } from '../client/strip.ts'
import { installPageStyles } from '../client/styles/page.ts'

/** The input the preview paints from, mutated by its own controls. */
const input: TraeSkinInput = {
  scheme: 'dark',
  accent: '#32f08c',
  strip: true,
  stripBare: false,
  pulse: true,
  pulseColor: 'follow',
  pulseScale: 1.6,
  pulsePeriodMs: 1600,
  pulseOpacity: 0.35,
}

/**
 * Read one control's value by id.
 * @param id - element id.
 * @returns the element, or undefined when the page does not carry it.
 */
function control<T extends HTMLElement>(id: string): T | undefined {
  return document.getElementById(id) as T | null ?? undefined
}

/** Write one line of the derivation readout. */
function derivedRow(label: string, value: string, swatch?: string): string {
  const chip = swatch === undefined
    ? ''
    : `<span class="dshPreviewSwatch" style="background:${swatch}"></span>`
  return `<dt>${label}</dt><dd>${chip}<code>${value}</code></dd>`
}

/** Repaint the derivation readout for the current draft. */
function paintDerived(): void {
  const target = control<HTMLDListElement>('derived')
  if (target === undefined) return
  const light = accentsFor(input.accent, LIGHT_SHELL)
  const dark = accentsFor(input.accent, DARK_SHELL)
  target.innerHTML = [
    derivedRow('fill', light.fill, light.fill),
    derivedRow('hover', light.hover, light.hover),
    derivedRow('wash 12%', light.wash, light.fill),
    derivedRow('text on white', `${light.text} (${formatRatio(light.textRatio)})`, light.text),
    derivedRow('text on near-black', `${dark.text} (${formatRatio(dark.textRatio)})`, dark.text),
    derivedRow('ramp, light', gradientCss(light.gradient)),
    derivedRow('ramp, dark', gradientCss(dark.gradient)),
  ].join('')
}

installPageStyles(document)
const skin = createSkin(input, document)
const copy = stripCopy()
let band: StatusBand | undefined = createStatusBand(document, copy)
band.setWordmark('DEEPSEEK HARNESS')
band.setActivity('unknown')

observeActivity((activity: Activity) => {
  skin.setActivity(activity)
  band?.setActivity(activity)
}, document)

/** Read the controls into the input and repaint everything. */
function readControls(): void {
  input.scheme = (control<HTMLSelectElement>('scheme')?.value ?? 'dark') as TraeScheme
  input.accent = control<HTMLInputElement>('accent')?.value.trim() ?? '#32f08c'
  input.strip = control<HTMLInputElement>('strip')?.checked ?? true
  input.stripBare = control<HTMLInputElement>('stripBare')?.checked ?? false
  input.pulse = control<HTMLInputElement>('pulse')?.checked ?? true
  const pulseMode = control<HTMLSelectElement>('pulseMode')?.value ?? 'follow'
  input.pulseColor = pulseMode === 'follow' ? 'follow' : (control<HTMLInputElement>('pulseColor')?.value.trim() || '#32f08c')
  input.pulseScale = Number(control<HTMLInputElement>('pulseScale')?.value ?? 1.6)
  input.pulsePeriodMs = Number(control<HTMLInputElement>('pulsePeriodMs')?.value ?? 1600)
  input.pulseOpacity = Number(control<HTMLInputElement>('pulseOpacity')?.value ?? 0.35)

  const wordmark = control<HTMLInputElement>('wordmark')?.value.trim() ?? ''
  if (band === undefined && input.strip) band = createStatusBand(document, copy)
  if (band !== undefined) band.setWordmark(wordmark === '' ? 'DEEPSEEK HARNESS' : wordmark)
  if (!input.strip && band !== undefined) {
    band.destroy()
    band = undefined
  }
  skin.apply()
  paintDerived()
  document.body.dataset.dshPreviewScheme = input.scheme
}

for (const id of ['scheme', 'accent', 'wordmark', 'strip', 'stripBare', 'pulse', 'pulseMode', 'pulseColor', 'pulseScale', 'pulsePeriodMs', 'pulseOpacity']) {
  const element = control(id)
  element?.addEventListener('input', readControls)
  element?.addEventListener('change', readControls)
}

// The mock turn: the same attribute the product publishes, on the same kind of node.
control<HTMLButtonElement>('simulate')?.addEventListener('click', (event) => {
  const button = event.currentTarget as HTMLButtonElement
  const answer = document.getElementById('answer')
  const running = answer?.hasAttribute('data-streaming') === true
  if (running) answer?.removeAttribute('data-streaming')
  else answer?.setAttribute('data-streaming', 'true')
  button.textContent = running ? '模拟一次推理' : '结束这次推理'
})

paintDerived()
