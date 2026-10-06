/**
 * Host half of the Trae skin.
 *
 * Three jobs, all of them small:
 *
 * 1. **Publish.** A loader row's `config` never reaches the page (the boot graph
 *    carries only id/inject/external), so the resolved values ride the index
 *    injection table instead, ahead of the boot scripts — the page's first frame
 *    already has the complete set rather than half of one.
 * 2. **Serve the form.** `Config` declares the page's knobs `.volatile()`, which
 *    makes this row a Settings namespace: the page's own card writes them through
 *    it, and the engine lands each write in the profile patch. That is the only
 *    durable store this plugin has — page `localStorage` is keyed by the engine's
 *    port, which changes on every launch.
 * 3. **Stay off the generated settings pages.** The knobs have a card of their own,
 *    so the row must not also be projected onto an automatic form; otherwise the
 *    same switches would appear in two places and disagree.
 *
 * The skin carries no packaged assets — every colour, rule and mark is written from
 * the browser half — so this half registers no route and needs no web server. An
 * absent or unreadable injection table therefore costs the page nothing: the browser
 * half falls back to its own compiled defaults, and the page paints exactly what an
 * unedited row would have published.
 */

import type { Context } from '@deepseek-ai/cordis'
import { DEFAULT_GLOBAL_NAME, PLUGIN_ID } from '../constants/plugin.ts'
import type { SettingsFormsLike, SettingsInjection } from '../types/host.ts'
import { resolveSettings } from '../utils/config.ts'
import { plainConfig, publishedSettings } from './publish.ts'
import type { Config } from './schema.ts'

export { Config } from './schema.ts'
export type { TraeConfig, TraeSettings } from '../types/config.ts'

/** Stable loader row id; matches the package name the page is served under. */
export const name = PLUGIN_ID

/**
 * Publish the settings into every rendered index page.
 *
 * The event is also the moment a page learns the skin exists at all, so the row is
 * pushed even when it configured nothing: the knobs then travel at their resolved
 * defaults, and the global still says the Host half is present. That presence is
 * what the card reads to tell "no settings transport" apart from "an older engine
 * is running the previous host half".
 * @param ctx - this plugin's host context.
 * @param config - the loader row's resolved config, if any.
 */
export function apply(ctx: Context, config?: Config): void {
  const settings = resolveSettings(config === undefined || config === null ? undefined : plainConfig(config))
  if (!settings.enabled) {
    ctx.logger.debug(`${PLUGIN_ID}: disabled by config`)
    return
  }
  const configured = config?.globalName
  const globalName = typeof configured === 'string' && configured !== ''
    ? configured
    : DEFAULT_GLOBAL_NAME
  const published = publishedSettings(settings)
  ctx.on('webserver/index-inject' as never, ((table: SettingsInjection[]) => {
    table.push({ kind: 'global', name: globalName, value: { ...published, enabled: true } })
  }) as never)
  ctx.logger.debug(`${PLUGIN_ID}: published ${Object.keys(published).length} settings`)

  // The knobs have a page of their own (sidebar → 插件 → dsh-trae-skin), so this row
  // must never also be projected onto a generated Settings page.
  ctx.inject(['settings'], (child) => {
    child.effect(() => {
      const settingsService = child.get('settings') as SettingsFormsLike | undefined
      if (settingsService === undefined) return
      return settingsService.configure({ auto: false }, ctx.fiber)
    }, `${PLUGIN_ID}: keep the knobs on the plugin card only`)
  })
}
