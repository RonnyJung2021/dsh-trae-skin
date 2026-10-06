/**
 * The palette: which shell is live, and the half of it a setting can move.
 *
 * The shells' own values are declared in the stylesheet, one block per shell, and
 * picked by the attribute this module's caller writes onto the body. What travels
 * through here is the rest — the accent's derivations, the two ramps, the light's
 * breathing — because those follow a setting and have to be recomputed without a
 * reload.
 *
 * The band's height and the light's radius are not here at all: they are compiled
 * constants, so the stylesheet writes them as lengths instead of routing them
 * through a variable that nothing could ever change.
 */

import { DYNAMIC_VARIABLES, SHELL_VARIABLES, SHELLS, type TraeShell } from '../constants/palette.ts'
import type { TraeScheme } from '../enums/scheme.ts'
import type { ShellId } from '../enums/shell.ts'
import type { SkinVariables, TraeSkinInput } from '../types/palette.ts'
import { accentsFor, gradientCss, gradientPlateCss } from '../utils/accent.ts'

export { DYNAMIC_VARIABLES }

/** The band's three shapes, as the body attribute spells them. */
export const STRIP_MODES = ['full', 'bare', 'off'] as const

/** One shape of the top band. */
export type StripMode = typeof STRIP_MODES[number]

/**
 * Pick the shell for one scheme choice and document state.
 * @param scheme - the configured choice; `auto` defers to the document.
 * @param documentIsDark - whether the document carries the product's dark attribute.
 * @returns the shell to paint.
 */
export function shellIdFor(scheme: TraeScheme, documentIsDark: boolean): ShellId {
  if (scheme === 'auto') return documentIsDark ? 'dark' : 'light'
  return scheme
}

/**
 * The product's own dark flag, as this scheme wants it.
 *
 * An explicit shell also moves the product's flag, because the skin deliberately
 * leaves the state colours, the toast and the diff backgrounds to the product: with
 * `dark` painted on a product left in light mode those surfaces would hand back
 * light amber and pale diff bands for a near-black page.
 *
 * `auto` returns `undefined` — "do not touch" — because writing the attribute the
 * mode follows would be self-referential.
 * @param scheme - the configured choice.
 * @returns true/false to force, or undefined to leave the attribute alone.
 */
export function productDarkFor(scheme: TraeScheme): boolean | undefined {
  if (scheme === 'dark') return true
  if (scheme === 'light') return false
  return undefined
}

/**
 * The band's shape for one input.
 * @param input - the resolved settings.
 * @returns `off` when the band is not painted, `bare` when it keeps only its content.
 */
export function stripModeFor(input: TraeSkinInput): StripMode {
  if (!input.strip) return 'off'
  return input.stripBare ? 'bare' : 'full'
}

/**
 * Turn one surface colour into the fade the product masks with.
 * @param surface - the surface the fade sits on.
 * @returns a two-stop gradient from that surface to nothing.
 * @remarks The reference's own mask ramps start at 20.19%, so this keeps its shape.
 */
export function fadeOf(surface: string): string {
  return `linear-gradient(180deg, ${surface} 20.19%, ${surface}00 100%)`
}

/**
 * Every custom property one shell declares, in stylesheet order.
 *
 * The stylesheet writes these into the shell blocks; the two fades are appended
 * here because a gradient needs its colour's alpha form, which a `var()` reference
 * cannot spell.
 * @param shell - the shell to declare.
 * @returns name and value pairs.
 */
export function shellDeclarations(shell: TraeShell): readonly (readonly [string, string])[] {
  const declarations: (readonly [string, string])[] = Object.entries(SHELL_VARIABLES)
    .map(([field, name]) => [name, String(Reflect.get(shell, field))] as const)
  declarations.push(
    ['--dsh-trae-think', fadeOf(shell.terrace)],
    ['--dsh-trae-think-select', fadeOf(shell.raised)],
  )
  return declarations
}

/**
 * The shell a value belongs to.
 * @param id - shell identifier.
 * @returns the shell table.
 */
export function shellFor(id: ShellId): TraeShell {
  return SHELLS[id]
}

/**
 * Render the half of the palette a setting moves.
 *
 * The reading of the product's activity is **not** here: it travels as a body
 * attribute, which is what the stylesheet's breathing rules select on, so a turn
 * starting does not rewrite forty custom properties.
 * @param input - the resolved settings.
 * @param shell - the shell being painted.
 * @returns variable name to value, in the order the applier writes them.
 */
export function skinVariables(input: TraeSkinInput, shell: TraeShell): SkinVariables {
  const accent = accentsFor(input.accent, shell)
  // The glow follows the accent by default, and it follows the *text* variant: the
  // glow is read against the page, not against the fill it came from.
  const pulseColor = input.pulseColor === 'follow' ? accent.text : input.pulseColor
  const pulse = input.pulse && input.strip
  return {
    '--dsh-trae-accent': accent.fill,
    '--dsh-trae-accent-hover': accent.hover,
    '--dsh-trae-accent-disabled': accent.disabled,
    '--dsh-trae-accent-text': accent.text,
    '--dsh-trae-accent-wash': accent.wash,
    '--dsh-trae-gradient': gradientCss(accent.gradient),
    '--dsh-trae-gradient-plate': gradientPlateCss(accent.gradient),
    '--dsh-trae-pulse-color': pulseColor,
    '--dsh-trae-pulse-scale': String(pulse ? input.pulseScale : 1),
    '--dsh-trae-pulse-period': `${pulse ? input.pulsePeriodMs : 0}ms`,
    '--dsh-trae-pulse-opacity': String(pulse ? input.pulseOpacity : 0),
  }
}
