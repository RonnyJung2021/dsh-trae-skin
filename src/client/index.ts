/**
 * Browser half of the Trae skin.
 *
 * Four pieces, in the order they matter: the stylesheet (the token remap and the
 * two shell blocks), the applier that names the live shell and writes the half of
 * the palette a setting moves, the status band, and the reading of the product's
 * streaming signal that the band's light breathes on.
 *
 * What the engine gives this half is only the resolved settings, which the Host
 * publishes into the page. There is no timeline and no session state to follow: the
 * skin paints the document and then watches exactly two things — the product's
 * theme attribute, in the one mode that follows it, and the product's streaming
 * signal.
 *
 * The half also owns the row's configuration card in the sidebar's plugin page. The
 * Host publishes at activation only, so a saved section is applied here as well:
 * the subscription below re-applies to the page, and the profile patch stays the
 * single durable copy of every choice.
 */

import type { Context } from '@deepseek-ai/cordis'
import { PLUGIN_ID, SETTINGS_NAMESPACE } from '../constants/plugin.ts'
import type { Activity } from '../enums/activity.ts'
import type { ConfigFormLike, ConfigFormsLike, SlotRegistryLike, TraeSection } from '../types/settings.ts'
import { sectionOf } from '../utils/section.ts'
import { observeActivity, type ActivityObserver } from './activity.ts'
import { TraeSkinPanel } from './components/Panel.tsx'
import { stripCopy } from './copy.ts'
import { createSkin, type SkinApplier } from './skin.ts'
import { hostPublished, readSettings } from './published.ts'
import { createStatusBand, type StatusBand } from './strip.ts'
import { installPageStyles } from './styles/page.ts'
import { installPanelStyles } from './styles/panel.ts'

export { readSettings } from './published.ts'

/** Stable entry name; matches the package name the Host serves this bundle under. */
export const name = PLUGIN_ID

/** This half reads no engine services; the settings arrive through the page. */
export const inject: string[] = []

/**
 * Mount the Trae skin for this page.
 * @param ctx - this plugin's client context.
 * @param doc - document to skin; the page by default.
 * @remarks One `input` object lives for the plugin's lifetime and is read on every
 *          paint, so a saved section re-applies without remounting the skin, the
 *          band or the observer: `applySection` writes the new values into it and
 *          asks the skin for one more paint.
 */
export function apply(ctx: Context, doc: Document = document): void {
  const settings = readSettings()
  if (!settings.enabled) return

  const input = {
    scheme: settings.scheme,
    accent: settings.accent,
    strip: settings.strip,
    stripBare: settings.stripBare,
    pulse: settings.pulse,
    pulseColor: settings.pulseColor,
    pulseScale: settings.pulseScale,
    pulsePeriodMs: settings.pulsePeriodMs,
    pulseOpacity: settings.pulseOpacity,
  }
  const copy = stripCopy()
  const skin: SkinApplier = createSkin(input, doc)
  // The wordmark is the band's own text, not part of the palette, so it is kept
  // beside the input rather than inside it.
  let wordmark = settings.wordmark
  let band: StatusBand | undefined = settings.strip ? createStatusBand(doc, copy) : undefined
  band?.setWordmark(wordmark)
  band?.setActivity('unknown')

  ctx.effect(() => installPageStyles(doc), 'dsh-trae-skin: the page stylesheet')

  // The light follows the product's own signal, and nothing else: the observer
  // reports a change twice per turn, so this costs a repaint per turn rather than
  // one per token.
  const activity: ActivityObserver = observeActivity((next: Activity) => {
    skin.setActivity(next)
    band?.setActivity(next)
  }, doc)

  /**
   * Apply one narrowed settings section to the live page.
   * @param section - fields the card saved; missing ones keep their value.
   */
  const applySection = (section: Partial<TraeSection>): void => {
    Object.assign(input, section)
    if (typeof section.wordmark === 'string') wordmark = section.wordmark
    skin.apply()
    band?.setWordmark(wordmark)
    if (input.strip && band === undefined) {
      band = createStatusBand(doc, copy)
      band.setWordmark(wordmark)
      band.setActivity('unknown')
      activity.refresh()
    } else if (!input.strip && band !== undefined) {
      band.destroy()
      band = undefined
    }
  }

  ctx.effect(() => () => {
    activity.destroy()
    band?.destroy()
    skin.destroy()
  }, 'dsh-trae-skin: document skin')

  // Read once, like the settings: whether the engine's host half is the current one
  // is a fact about this page load, and the card's explanation depends on it.
  const knobsPublished = hostPublished()
  ctx.effect(() => installPanelStyles(doc), 'dsh-trae-skin: the card stylesheet')

  // The row's knobs have a card of their own in the plugin page, and the Settings
  // form behind it is the only store: one write path, the profile patch, so a choice
  // survives the engine's next port.
  ctx.inject(['configForms', 'slots'], (child) => {
    const forms = child.get('configForms') as ConfigFormsLike | undefined
    if (forms === undefined) return
    const form = forms.get<TraeSection>(SETTINGS_NAMESPACE)
    child.effect(() => {
      const sync = (): void => { applySection(sectionOf(form.getSnapshot().value)) }
      const unsubscribe = form.subscribe(sync)
      sync()
      return unsubscribe
    }, 'dsh-trae-skin: apply the saved card settings')

    const slots = child.get('slots') as SlotRegistryLike | undefined
    if (slots === undefined) return
    child.effect(() => {
      slots.inject('plugins.bundle.config', () => {
        slots.register(
          {
            name: 'plugins.bundle.config',
            // Keyed by the bundle's package name, which is also the namespace.
            key: SETTINGS_NAMESPACE,
            inject: () => ({ form: form as ConfigFormLike<TraeSection>, hostPublished: knobsPublished }),
          },
          TraeSkinPanel,
        )
      })
    }, 'dsh-trae-skin: the knobs on the plugin card')
  })
}
