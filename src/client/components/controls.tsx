/**
 * The card's presentational pieces.
 *
 * They hold no state: the panel owns the draft and hands each control its value and
 * its change handler, so this file stays a set of leaves and the panel stays the one
 * component with behaviour.
 *
 * The markup mirrors the sibling MiMo skin's card element for element — a labelled
 * field, a switch row, a readout pair — so the two cards read as one series. The class
 * prefix differs; the shape does not.
 */

import type { ReactNode } from 'react'
import type { DerivedValue } from '../../types/panel.ts'

/** One labelled control row, with its hint or its error underneath. */
export function Field(props: {
  label: string
  hint: string
  error?: string
  children: ReactNode
}): ReactNode {
  return (
    <label className="dshTraeField">
      <span className="dshTraeFieldLabel">{props.label}</span>
      <span className="dshTraeFieldControl">{props.children}</span>
      <span className={props.error === undefined ? 'dshTraeFieldHint' : 'dshTraeError'}>
        {props.error ?? props.hint}
      </span>
    </label>
  )
}

/** One boolean row: the switch, then its label and hint stacked beside it. */
export function Toggle(props: {
  label: string
  hint: string
  checked: boolean
  disabled: boolean
  onChange: (next: boolean) => void
}): ReactNode {
  return (
    <label className="dshTraeToggle">
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={event => { props.onChange(event.target.checked) }}
      />
      <span>
        <span className="dshTraeFieldLabel">{props.label}</span>
        <span className="dshTraeFieldHint">{props.hint}</span>
      </span>
    </label>
  )
}

/** One colour swatch, at the size a control carries. */
export function Swatch(props: { color: string }): ReactNode {
  return <span className="dshTraeSwatch" style={{ background: props.color }} />
}

/**
 * One derived value on the readout line: its swatch, its label, its literal and — when
 * it carries text — the contrast it was measured at.
 */
export function Derived(props: { label: string, entry: DerivedValue }): ReactNode {
  return (
    <span className="dshTraePreviewPair">
      <span className="dshTraeSwatchSmall" style={{ background: props.entry.value }} />
      {props.label}
      {' '}
      <code>{props.entry.value}</code>
      {props.entry.ratio === undefined ? null : ` (${props.entry.ratio})`}
    </span>
  )
}

/** One four-stop ramp on the same line, painted so the shape of it can be seen. */
export function Ramp(props: { label: string, stops: readonly string[] }): ReactNode {
  return (
    <span className="dshTraePreviewPair">
      <span className="dshTraeRamp">
        {props.stops.map(stop => <span key={stop} style={{ background: stop }} />)}
      </span>
      {props.label}
      {' '}
      <code>{props.stops.join(' ')}</code>
    </span>
  )
}
