/**
 * The card's stylesheet.
 *
 * The card is mounted inside the product's own plugin page, so it is styled from the
 * product's tokens rather than from the skin's palette: the values it edits are the
 * skin's, but the form around them belongs to the page.
 *
 * The measurements are the ones the sibling MiMo skin's card uses — the same note, the
 * same 84px label column, the same 6px controls inside an 8px surface, the same readout
 * line and footer. The two plugins are installed independently and share no code, but
 * their cards are meant to read as one series, so the layout language is kept
 * deliberately identical. The skinned page still follows the reference site's own
 * 2 / 4 / 8px scale; this is the card around the settings, not the page.
 *
 * One stylesheet per page, tagged with this plugin's own attribute, and every rule
 * hangs off this plugin's own card root: a sheet that reached past its own card could
 * restyle another plugin's form.
 */

import { PANEL_STYLE_ATTRIBUTE } from '../../constants/dom.ts'
import { PLUGIN_ID } from '../../constants/plugin.ts'

/** Class prefix the card's own elements wear. */
const PANEL = 'dshTrae'

/** Install the card's stylesheet once per page. */
export function installPanelStyles(doc: Document = document): () => void {
  const existing = doc.querySelector(`style[${PANEL_STYLE_ATTRIBUTE}]`)
  if (existing !== null) return () => {}
  const element = doc.createElement('style')
  element.setAttribute(PANEL_STYLE_ATTRIBUTE, '')
  element.textContent = panelStyles()
  doc.head.append(element)
  return () => { element.remove() }
}

/**
 * The card's stylesheet text.
 * @returns the CSS.
 */
export function panelStyles(): string {
  const root = `[data-plugin-config="${PLUGIN_ID}"]`
  return `
${root} {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #101114);
}

${root} .${PANEL}Note {
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
  color: var(--dsw-alias-label-secondary, #4b5058);
  font-size: 12px;
  line-height: 18px;
}

/* A warning carries the product's own alert colour: the skin leaves status colours
   alone, and a stale Host half is a state rather than a brand moment. */
${root} .${PANEL}Note[data-tone='warn'] {
  border: 1px solid var(--dsw-alias-state-warn-primary, #b54708);
  color: var(--dsw-alias-label-primary, #101114);
}

${root} .${PANEL}Grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 14px 20px;
}

${root} .${PANEL}Field {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 3px 10px;
  align-items: center;
}

${root} .${PANEL}FieldLabel {
  font-weight: 500;
}

${root} .${PANEL}FieldControl {
  display: flex;
  align-items: center;
  gap: 8px;
}

${root} .${PANEL}FieldHint {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

${root} .${PANEL}Error {
  grid-column: 1 / -1;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-state-error-primary, #d92d20);
}

${root} .${PANEL}Field select,
${root} .${PANEL}Field input {
  width: 100%;
  min-width: 128px;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
}

${root} .${PANEL}Swatch {
  flex: none;
  width: 20px;
  height: 20px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 4px;
}

${root} .${PANEL}SwatchSmall {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 2px;
}

/* The derived readout: a heading in the same weight the labels use, then one wrapped
   line of label, swatch, literal and measured ratio. */
${root} .${PANEL}Derived {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

${root} .${PANEL}DerivedTitle {
  margin: 0;
  font-weight: 500;
}

${root} .${PANEL}Preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin: 0;
  font-size: 11.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}

${root} .${PANEL}PreviewPair code {
  font-family: var(--ds-font-family-code, monospace);
  color: var(--dsw-alias-label-secondary, #4b5058);
}

${root} .${PANEL}Ramp {
  display: inline-flex;
  flex: none;
  width: 60px;
  height: 10px;
  margin-right: 5px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 2px;
  overflow: hidden;
  vertical-align: -1px;
}

${root} .${PANEL}Ramp > span {
  flex: 1;
}

${root} .${PANEL}Toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

${root} .${PANEL}Toggle {
  display: flex;
  gap: 9px;
  align-items: flex-start;
}

${root} .${PANEL}Toggle > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

${root} .${PANEL}Toggle input[type='checkbox'] {
  margin: 2px 0 0;
}

/* The breathing light is a block of its own, so its four appearance values never sit
   between the band's switches. It carries the note's own surface and radius, which is
   what keeps a block inside the card reading as part of the same form. */
${root} .${PANEL}Group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f4f5f7);
}

${root} .${PANEL}GroupTitle {
  padding: 0;
  font-weight: 500;
}

${root} .${PANEL}Group:disabled {
  opacity: 0.55;
}

${root} .${PANEL}Foot {
  display: flex;
  align-items: center;
  gap: 12px;
}

${root} .${PANEL}Foot button {
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l3, #00000024);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

${root} .${PANEL}Foot button[data-variant='primary'] {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}

${root} .${PANEL}Foot button:disabled {
  opacity: 0.55;
  cursor: default;
}

${root} .${PANEL}Status {
  font-size: 11.5px;
  color: var(--dsw-alias-label-tertiary, #6b7280);
}
`.trim()
}
