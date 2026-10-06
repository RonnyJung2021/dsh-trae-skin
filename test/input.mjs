/**
 * One skin input, with the compiled defaults filled in.
 *
 * The applier takes a whole input, and a test that cares about one field should not
 * have to restate the other nine — nor should it break every time a tenth is added.
 */

import { loadModule } from './load-module.mjs'

const { resolveSettings } = await loadModule('utils/config.ts')

/**
 * Build the input the applier paints from.
 * @param overrides - fields to change from the compiled defaults.
 * @returns the input.
 */
export function skinInput(overrides = {}) {
  const settings = { ...resolveSettings(undefined), ...overrides }
  return {
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
}

/**
 * The same, with no overrides at all.
 * @returns the compiled default input.
 */
export function defaultInput() {
  return skinInput()
}
