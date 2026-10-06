/**
 * The card's own configuration panel.
 *
 * This is the only React in the plugin: the plugin page hands a slot entry a
 * component, so the panel is one small component — plus the leaf controls it
 * renders — and nothing else.
 *
 * Edits do **not** write through on every keystroke. A draft lives here, Save is
 * what commits it, and Save is refused while the draft holds a field the settings
 * service could not accept — a colour literal that does not parse, a glow outside
 * its range, a wordmark the band cannot render. That is also why the text inputs are
 * controlled: with a local draft there is no round trip to lose the caret to.
 *
 * The committed values still arrive from the Settings form, which is the only
 * durable store: a choice survives a reload, a new engine port, and a different
 * window.
 *
 * The seven things the card edits are grouped the way they are read: the shell and
 * its accent, the band, and then the light's breathing in a block of its own — its
 * four appearance values never sit between the band's switches.
 */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  PULSE_OPACITY_MAX,
  PULSE_OPACITY_MIN,
  PULSE_PERIOD_MAX_MS,
  PULSE_PERIOD_MIN_MS,
  PULSE_SCALE_MAX,
  PULSE_SCALE_MIN,
} from '../../constants/plugin.ts'
import type { ErrorField } from '../../constants/config.ts'
import type { TraePanelProps, PanelCopy } from '../../types/panel.ts'
import type { ConfigFormLike, ConfigFormView, TraeSection } from '../../types/settings.ts'
import { completeSection, invalidFields, isDirty, SECTION_DEFAULTS, sectionOps } from '../../utils/section.ts'
import { accentPreview } from '../accent-preview.ts'
import { panelCopy } from '../copy.ts'
import { Derived, Field, Ramp, Swatch, Toggle } from './controls.tsx'

/**
 * Subscribe a component to one form.
 * @param form - the settings form.
 * @returns the latest state.
 */
function useFormView(form: ConfigFormLike<TraeSection>): ConfigFormView<TraeSection> {
  const [state, setState] = useState(() => form.getSnapshot())
  useEffect(() => form.subscribe(() => { setState(form.getSnapshot()) }), [form])
  return state
}

/**
 * The Trae skin card: every knob this row has, saved to the profile patch.
 * @param props - the page's view and this row's settings form.
 * @returns the panel.
 */
export function TraeSkinPanel(props: TraePanelProps): ReactNode {
  const copy: PanelCopy = panelCopy()
  const { form, hostPublished } = props
  const state = useFormView(form)
  const committed = completeSection(state.value)
  const committedKey = JSON.stringify(committed)
  const [draft, setDraft] = useState<TraeSection>(committed)
  // One dependency, and it is the committed values as a value: the section is a
  // fresh object on every render, so depending on the object would reset the draft
  // continuously and no edit would ever survive a keystroke.
  useEffect(() => { setDraft(committed) }, [committedKey])

  const writable = state.status === 'ready' && state.writable
  const invalid = invalidFields(draft)
  const dirty = isDirty(draft, state.value === undefined ? undefined : committed)

  /**
   * Write one field of the draft.
   * @param field - field name inside the row's config section.
   * @param next - value to place in the draft.
   */
  const edit = <K extends keyof TraeSection>(field: K, next: TraeSection[K]): void => {
    setDraft(current => ({ ...current, [field]: next }))
  }

  /**
   * Commit one whole section.
   * @param next - the values to write.
   */
  const save = (next: TraeSection): void => {
    void form.mutate(sectionOps(next))
  }

  const note = state.status === 'unavailable'
    ? hostPublished ? copy.noteUnavailable : copy.noteStaleHost
    : state.status === 'loading' ? copy.noteLoading : copy.noteReady

  const status = !writable
    ? copy.stateLocked
    : invalid.length > 0
      ? copy.error[invalid[0] as ErrorField]
      : dirty ? copy.stateDirty : copy.stateClean

  const errorOf = (field: ErrorField): string | undefined =>
    invalid.includes(field) ? copy.error[field] : undefined

  const preview = accentPreview(draft.accent)
  // The light and the glow live on the band, so with the band off there is nothing
  // for them to be shown on — the block says so instead of remembering the values
  // for later.
  const bandOff = !draft.strip

  return (
    <div className="dshTraePanel" data-plugin-config="dsh-trae-skin">
      <p className="dshTraeNote" data-tone={state.status === 'unavailable' && !hostPublished ? 'warn' : undefined}>
        {note}
      </p>

      <div className="dshTraeGrid">
        <Field label={copy.field.scheme.label} hint={copy.field.scheme.hint} error={errorOf('scheme')}>
          <select
            value={draft.scheme}
            disabled={!writable}
            onChange={event => { edit('scheme', event.target.value as TraeSection['scheme']) }}
          >
            {copy.schemeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        <Field label={copy.field.accent.label} hint={copy.field.accent.hint} error={errorOf('accent')}>
          <Swatch color={draft.accent} />
          <input
            type="text"
            spellCheck={false}
            value={draft.accent}
            disabled={!writable}
            onChange={event => { edit('accent', event.target.value) }}
          />
        </Field>

        <Field label={copy.field.wordmark.label} hint={copy.field.wordmark.hint} error={errorOf('wordmark')}>
          <input
            type="text"
            spellCheck={false}
            value={draft.wordmark}
            disabled={!writable}
            onChange={event => { edit('wordmark', event.target.value) }}
          />
        </Field>
      </div>

      {preview === undefined ? null : (
        <div className="dshTraeDerived">
          <p className="dshTraeDerivedTitle">{copy.derived}</p>
          <p className="dshTraePreview">
            <Derived label={copy.derivedFill} entry={{ value: preview.fill }} />
            <Derived label={copy.derivedHover} entry={{ value: preview.hover }} />
            <Derived label={copy.derivedWash} entry={{ value: preview.wash }} />
            <Derived label={copy.derivedTextLight} entry={preview.textLight} />
            <Derived label={copy.derivedTextDark} entry={preview.textDark} />
            <Ramp label={copy.derivedGradientLight} stops={preview.gradientLight} />
            <Ramp label={copy.derivedGradientDark} stops={preview.gradientDark} />
          </p>
        </div>
      )}

      <div className="dshTraeToggles">
        <Toggle
          label={copy.field.strip.label}
          hint={copy.field.strip.hint}
          checked={draft.strip}
          disabled={!writable}
          onChange={next => { edit('strip', next) }}
        />

        <Toggle
          label={copy.field.stripBare.label}
          hint={bandOff ? copy.stripOffNote : copy.field.stripBare.hint}
          checked={draft.stripBare}
          disabled={!writable || bandOff}
          onChange={next => { edit('stripBare', next) }}
        />
      </div>

      <fieldset className="dshTraeGroup" disabled={!writable || bandOff}>
        <legend className="dshTraeGroupTitle">{copy.pulseGroup}</legend>

        <div className="dshTraeGrid">
          <Toggle
            label={copy.field.pulse.label}
            hint={bandOff ? copy.stripOffNote : copy.field.pulse.hint}
            checked={draft.pulse}
            disabled={!writable || bandOff}
            onChange={next => { edit('pulse', next) }}
          />

          <Field label={copy.field.pulseColor.label} hint={copy.field.pulseColor.hint} error={errorOf('pulseColor')}>
            <select
              value={draft.pulseColor === 'follow' ? 'follow' : 'literal'}
              disabled={!writable || bandOff || !draft.pulse}
              onChange={event => {
                edit('pulseColor', event.target.value === 'follow' ? 'follow' : (preview?.fill ?? '#32f08c'))
              }}
            >
              {copy.pulseColorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {draft.pulseColor === 'follow' ? null : (
              <input
                type="text"
                spellCheck={false}
                value={draft.pulseColor}
                disabled={!writable || bandOff || !draft.pulse}
                onChange={event => { edit('pulseColor', event.target.value) }}
              />
            )}
          </Field>

          <Field label={copy.field.pulseScale.label} hint={copy.field.pulseScale.hint} error={errorOf('pulseScale')}>
            <input
              type="number"
              min={PULSE_SCALE_MIN}
              max={PULSE_SCALE_MAX}
              step={0.1}
              value={draft.pulseScale}
              disabled={!writable || bandOff || !draft.pulse}
              onChange={event => { edit('pulseScale', Number(event.target.value)) }}
            />
          </Field>

          <Field label={copy.field.pulsePeriodMs.label} hint={copy.field.pulsePeriodMs.hint} error={errorOf('pulsePeriodMs')}>
            <input
              type="number"
              min={PULSE_PERIOD_MIN_MS}
              max={PULSE_PERIOD_MAX_MS}
              step={100}
              value={draft.pulsePeriodMs}
              disabled={!writable || bandOff || !draft.pulse}
              onChange={event => { edit('pulsePeriodMs', Number(event.target.value)) }}
            />
          </Field>

          <Field label={copy.field.pulseOpacity.label} hint={copy.field.pulseOpacity.hint} error={errorOf('pulseOpacity')}>
            <input
              type="number"
              min={PULSE_OPACITY_MIN}
              max={PULSE_OPACITY_MAX}
              step={0.05}
              value={draft.pulseOpacity}
              disabled={!writable || bandOff || !draft.pulse}
              onChange={event => { edit('pulseOpacity', Number(event.target.value)) }}
            />
          </Field>
        </div>
      </fieldset>

      <div className="dshTraeFoot">
        <button
          type="button"
          data-variant="primary"
          disabled={!writable || invalid.length > 0 || !dirty}
          onClick={() => { save(draft) }}
        >
          {copy.save}
        </button>
        <button
          type="button"
          disabled={!writable || committedKey === JSON.stringify(SECTION_DEFAULTS)}
          onClick={() => {
            setDraft(SECTION_DEFAULTS)
            save(SECTION_DEFAULTS)
          }}
        >
          {copy.reset}
        </button>
        <span className="dshTraeStatus">{status}</span>
      </div>
    </div>
  )
}
