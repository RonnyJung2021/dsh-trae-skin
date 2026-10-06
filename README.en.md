<div align="center">

# dsh-trae-skin

A **skin-only plugin** for the DSH Web GUI — near-black paper, a mint accent, a gradient wordmark band across the top, 2px corners and 0.5px inner-highlight shadows.

[中文](README.md) / English

[Install](#install) · [First run](#first-run) · [Configuration](#configuration) · [Layout](#layout) · [Development](#development)

<p>
  <a href="https://www.npmjs.com/package/dsh-trae-skin"><img src="https://img.shields.io/badge/version-0.2.0-blue" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="license"></a>
  <img src="https://img.shields.io/badge/DSH-%3E%3D0.1.5--rc.2-8b5cf6" alt="DSH">
  <img src="https://img.shields.io/badge/tests-270%20passing-brightgreen" alt="tests">
  <img src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933" alt="node">
</p>

</div>

***

<!-- Images use the repository's absolute address: npm cannot resolve a relative path when it
     renders this README, and docs/… would break into image frames there. -->
<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-before.png" alt="Before: the product's own shell" width="49%">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-dark.png" alt="After: with the skin on (dark)" width="49%">
</p>

Same engine, same page: **left** is the product's own shell, **right** is the same page with the skin on. Both are screenshots of a real engine in a real browser, not mock-ups.

## What it is

It turns the DSH Web GUI into the look of [`trae.cn`](https://www.trae.cn/). It adds **no features and changes nothing but the look**: sidebar, message column, composer card, menus and code blocks change together, in both a light and a dark shell. It is for anyone who wants DSH in that near-black-paper, mint-accent, dark-first design.

### What it costs

| Item | Value |
| --- | --- |
| Payload | `lib/index.js` 45.7 KB / `lib/client.js` 76.7 KB |
| Product tokens remapped | 93 (92 `--dsw-*` aliases plus `--ds-font-family-code`) |
| The skin's own variables | 42 `--dsh-trae-*` |
| Bundled assets / runtime deps | **0** (no font files, no images; the engine supplies `@deepseek-ai/cordis`, and MIT packages such as `schemastery` are inlined into `lib/index.js` at build time) |
| Tests | 270 cases in 12 files, about 0.2 s |

## What it does

### Whole-page reskin

Recoloured only through the product's documented `--dsw-*` aliases; the page structure and the generated CSS-module class names are untouched.

| Part | Dark | Light | Taken from the reference |
| --- | --- | --- | --- |
| Page ground | `#0a0b0d` | `#ffffff` | `--bg-bg-base-default` / the light block's `base` |
| Raised surfaces (menus, code blocks) | `#121314` | `#fafafa` | `--bg-bg-base-secondary` / `card` |
| Body text | `#f5f9fe` | `#1a1a1a` | `--text-text-default` |
| Secondary / tertiary text | `#a6aab5` / `#787d87` | `#5b6066` / `#6f757b` | `--text-text-secondary` / `tertiary` |
| Three hairline steps | white at 6% / 12% / 18% | `#4d6b991f` / `2e` / `5c` | `--border-border-neutral-l1…l3` |
| Four ink washes | `#edeff20a` … `2e` | `#5663770f` … `33` | `--bg-bg-overlay-l1…l4` |

### Three shells: dark, light, or follow the product

**Dark is the default**: the reference is a dark-first product (`color-scheme:dark`, with no light mode), so following the product would show a light-system user a design it never shipped. Under the follow setting the skin repaints whenever the product switches, and the light/dark switch stays in the user's hands. Every change **repaints on the spot**, with no page reload.

<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-light.png" alt="The light shell" width="100%">
</p>

**The state colours are deliberately left alone**: warn / success / error, the toast and tooltip surfaces, the coloured diff backgrounds and syntax highlighting all stay with the product, which already switches them itself on `body[data-ds-dark-theme]`.

### One field in, a whole safe palette out

You fill in one `#rrggbb` (the reference's own green, `#32f08c`, by default) and the skin derives the fill, a darker hover step, a 12% wash, a text-safe step, and two gradient ramps from it.

- The text-safe step lands on **WCAG AA 4.5:1** automatically, measured against the paper it is actually read on (white for the light shell, near-black for the dark one). Every derived value is quantised to `#rrggbb` and then checked again — rounding alone can pull 4.50 down to 4.48.
- Measured with the default accent: `#1c864e` as text in the light shell (4.60:1) and `#32f08c` in the dark one (13.11:1).
- The gradients follow: the default accent uses the reference's own four stops (`#3ee1a3 #32f08c #60f2bd #a0fde7` in the dark shell, a separate set in the light one); any other colour derives its ramps along the **same rhythm** (an HSL offset measured off the two originals).
- **The card prints the measured numbers**: the “Derived colours” row shows every derived value in both shells together with its measured contrast ratio — figures, not promises.

<!-- TODO: screenshot — a close-up of the “Derived colours” read-out row. -->

### The top status band

A fixed 32px band, reading left to right: **the light → the gradient wordmark → the state in words for screen readers**.

- **The wordmark** is small monospace type on a four-stop gradient, over a 16% plate of the same gradient (the reference's gradient-label treatment). Its text is editable, `DEEPSEEK HARNESS` by default, 1–24 characters; an over-long value is **refused, not truncated**.
- **The light** is a ring when idle, and fills in when the composer takes focus or the pointer enters it.
- **It only breathes while reasoning**: the pulse runs while the product reports reasoning or an answer in progress; when there is **no readable `data-streaming` signal it breathes continuously** (a still dot reads as “not working”). The signal comes from the product's own attribute, the observer watches that one attribute only, and the reading **changes twice per turn** rather than following the token stream.
- **The whole band can be turned off** (leaving only the colours and the type), or **kept as content only** (no fill of its own, no foot rule).
- **Accessibility**: the band declares `role="status"`, and the state words (idle / working) are for screen readers only.
- The band is **read-only**: nothing on it is clickable, and it declares the product's `data-window-drag`, so the top of a desktop window can still be dragged.

<!-- TODO: screenshot — a close-up of the band, idle ring and breathing state. -->

### Detail work

| Item | Treatment |
| --- | --- |
| Primary button | The reference's call to action: `#32f08c` fill with near-black type |
| Corners | Only 2 / 4 / 8px (`2px` does most of the work); no 6 / 10 / 16px in-betweens |
| Rules | 1px throughout, at the reference's three alpha steps |
| Shadows | A 0.5px inner highlight with a soft drop; the light shell gets corrected weights |
| Type | A platform UI stack (Inter as the first fallback), a display face for headings, monospace for the wordmark and code (JetBrains Mono first); **no font files ship** |
| Switches | Both states come from the skin's own scale: on is the accent, off is a hairline |
| Version badge | Sidebar badges become “type on a dark surface”: near-black on white in the light shell, inverted in the dark one, never dark-on-dark |
| Scrollbars / focus ring / links | Follow the skin; the focus ring is a 1px neutral stroke with a 2px offset, **never the brand colour** (the brand is reserved for state) |
| Deliberately absent | Radial gradients / glows, `backdrop-filter`, blend modes, noise — all four appear 0 times across the reference site, and tests assert each one stays out |

### The plugin card

Sidebar **Plugins → dsh-trae-skin**; the card below it is the plugin's **own settings page**. The ten appearance fields sit in two places: five in the card body (**Shell, Accent, Wordmark, Top band, Content only**), and five in the **Breathing light** group (**Light breathes, Glow colour, Glow spread, Breath period, Glow strength**).

- **The breathing light is a block of its own**: the glow colour (follow the accent, or name one), the spread, the period and the strength all live together there rather than being wedged in among the band's fields.
- One **“Restore defaults”** writes every appearance field back.
- **Nothing changes until Save is pressed**: edits are not written back while you type, and Save checks every field first — an invalid value is refused, with the reason given under that field.
- **Changes repaint on the spot**, and **they stick**: the values are written into the profile's config, so they survive a new port, an engine restart, and switching between the desktop window and the panel.
- The card states its condition: it says so when the form is not writable, and when it detects the older host half running in the engine it tells you plainly that the **engine** is what needs restarting, not the page.
- With the band off, the pulse and breathing-light blocks are **disabled on the card** rather than quietly recorded for later.

<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-card.png" alt="The plugin's settings card" width="100%">
</p>

The card's layout language is deliberately shared with the other skin in this series (`dsh-mimo-skin`): the same note box, the same 84px label column, the same read-out rows and footnote. The two plugins install independently and neither depends on the other, but the two settings pages read as one series.

## Install

### Requirements

| Item | Requirement |
| --- | --- |
| DSH | `dsh-v0.1.5-rc.2` and later, backwards compatible (the same floor as the series' `dsh-mimo-skin`) |
| Node.js | `^22.19.0 \|\| >=24.0.0` (needed only if you build it locally) |
| System | Whatever the DSH Web GUI runs on: macOS, Windows or Linux |

### Option 1: the command line

```bash
# Straight from GitHub: the repo carries the built lib/, so the installer builds nothing
dsh plugin --profile web add https://github.com/RonnyJung2021/dsh-trae-skin

# Or by package name, once it is published to npm
dsh plugin --profile web add dsh-trae-skin
```

> **A GitHub install relies on the `lib/` in the repo; do not turn it back into “build after install”.**
> pnpm refuses to run a git dependency's build scripts (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`) unless
> the machine lists the package under `allowBuilds` in the profile's `pnpm-workspace.yaml`,
> and that key has to be copied character for character from what pnpm printed. So the payload is
> committed and the build moved to `prepack`: a git install has nothing to build and nothing to allow.

### Option 2: the Plugins page

Sidebar **Plugins** → **Add plugin** → enter `dsh-trae-skin` (or the GitHub URL above) → **Install** →
**Enable now** when it finishes.

### Installing from the working directory, while developing

```bash
node scripts/install-profile.mjs --home /path/to/home              # install
node scripts/install-profile.mjs --home /path/to/home --dry-run    # print what it would change
node scripts/install-profile.mjs --home /path/to/home --uninstall  # remove
```

`--home` defaults to `$DSH_HOME` or `~/.dsh`, and `--profile` to `web`. That profile has to have run the engine once (`profiles/web/package.json` exists) before anything can be installed into it.

It writes the three things the Plugins page itself writes for a local package: a `link:` dependency plus the package name in `dsh.profile.bundles` in the profile's `package.json`, the `node_modules/<name>` symlink, and the importer entry in `pnpm-lock.yaml`. Along the way it takes out an older `file://`-style `insert` row (which would otherwise load the plugin twice), and backs up every file it edits as `*.bak-dsh-trae-skin`. Running it again is idempotent.

Installing as a bundle is what puts the row in play; the `dsh-trae-skin` row on the Plugins page is its on/off switch and its uninstall entry.

> **The host half loads once, when the engine process starts.** After installing, after editing `cordis.patch.yml`, or after upgrading the plugin, the thing to restart is the **engine**. The browser half is hot: a page reload picks it up. The card says so plainly when it finds the older host half still running in the engine.

### First run

1. Install and **enable** it by either route above.
2. Open the GUI: sidebar **Plugins → Installed → dsh-trae-skin**. The card below it is the plugin's **own settings page**.
3. Change an appearance field and press **Save**; the page repaints at once.

### Uninstall

```bash
# Installed from GitHub or npm
dsh plugin --profile web remove dsh-trae-skin

# Installed from the working directory as a link:
node scripts/install-profile.mjs --home /path/to/home --uninstall
```

Or press **Uninstall** on this package's row on the Plugins page. The stylesheet, the status band, the breathing light and the palette written into the body all go with it, the page returns to the product's own shell, and **nothing is left behind**.

## Configuration

Ten appearance fields, all optional. Omit one and its default applies; an invalid value falls back field by field — a broken skin should never hold up the GUI's startup.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `scheme` | `dark` \| `light` \| `auto` | `dark` | The shell; `auto` follows the product's own light/dark setting |
| `accent` | `#rgb` / `#rrggbb` | `#32f08c` | The accent (used as a fill); the text-safe step, the 12% wash and both ramps derive from it |
| `wordmark` | string 1–24 | `DEEPSEEK HARNESS` | The gradient line on the band; an over-long value is **refused**, not truncated |
| `strip` | boolean | `true` | Whether to paint the top status band |
| `stripBare` | boolean | `false` | Whether the band keeps only its content (no fill, no foot rule) |
| `pulse` | boolean | `true` | Whether the light breathes while the product reports reasoning |
| `pulseColor` | `follow` / `#rrggbb` | `follow` | The glow colour; `follow` derives it from the accent |
| `pulseScale` | number 1.2–2.4 | `1.6` | The spread, as a multiple of the light's radius |
| `pulsePeriodMs` | number 800–4000 | `1600` | One breath, in milliseconds |
| `pulseOpacity` | number 0.1–0.6 | `0.35` | The glow's strength |
| `enabled` | boolean | `true` | Whether the skin renders at all (deployment, not on the card) |
| `globalName` | string | `__DSH_TRAE_SKIN__` | The global the host writes into the page (deployment, not on the card) |

Written into the profile's patch (`profiles/web/cordis.patch.yml`):

```yaml
- insert:
    - id: dsh-trae-skin
      name: dsh-trae-skin
      config:
        scheme: dark                 # dark | light | auto
        accent: '#32f08c'            # any #rrggbb
        wordmark: DEEPSEEK HARNESS   # 1–24 characters
        strip: true
        stripBare: false
        pulse: true
        pulseColor: follow           # follow | '#rrggbb'
        pulseScale: 1.6
        pulsePeriodMs: 1600
        pulseOpacity: 0.35
        enabled: true
```

What the card writes on Save is the plain `- id: dsh-trae-skin` override with a `config:` block (not an `insert`) — the form the Plugins page writes itself.

## Layout

```
dsh-trae-skin/
├── src/
│   ├── constants/     identity, the card's field list, DOM names, the palette and token map
│   ├── enums/         closed sets: shell, scheme, activity reading, settings form
│   ├── types/         shapes both halves share
│   ├── utils/         colour arithmetic, accent derivation, config narrowing, card sections
│   ├── host/          the host half: publishing, the settings namespace, the schema
│   ├── client/        the browser half: stylesheet, applier, status band, signal reading, card
│   └── preview/       the self-test preview's entry (real modules, simulated shell)
├── locale/            the zh / en copy
├── lib/               build output (index.js host, client.js browser, preview.js preview), committed
├── preview/           the self-test preview page (double-click index.html)
├── test/              unit tests
├── docs/              screenshots
└── scripts/           install into / remove from one profile
```

### The two halves

| Half | What it does | Why it is split this way |
| --- | --- | --- |
| Host (`lib/index.js`, thin) | Publishes the settings into the page through the index injection table (so the first frame has the full set), turns the appearance fields into a settings namespace (which is how the card's edits reach the profile), and keeps this row off the generated settings pages | A loader row's `config` never reaches the page (the boot graph carries only id/inject/external), and the card's writes can only land in the profile through the settings service |
| Browser (`lib/client.js`) | Installs the stylesheet, writes the palette, mounts the status band and the breathing light, and repaints on the card's changes | A skin has no timeline and no session state; all it needs is settings |

The host half **registers no routes, needs no web server and ships no bundled assets**. The browser half **falls back to its own defaults when it cannot read the host's values** (a missing or unreadable injection table costs the page nothing).

On the product side it touches only documented hooks: `data-composer-card`, `data-menu-material`, the `role` / `aria-checked` a control publishes itself, `data-ds-dark-theme`, `data-streaming`, and `body` / `#root`. It **depends on no generated CSS-module class name**, and tests pin each of those down.

### Compatibility

- Built for DSH alone, with no cross-host support. The floor is `dsh-v0.1.5-rc.2`, backwards compatible from there — the same floor as the series' `dsh-mimo-skin`, since both halves call the same engine interfaces (the `webserver/index-inject` table, `settings.configure`, and the client module table).
- Known limits are in [Trade-offs](#trade-offs) below.

### Development

```bash
npm install          # build-time dependencies (esbuild + schemastery)
npm run build        # one command builds both halves and the preview
npm run watch        # the same, with --watch
npm test             # unit tests
```

| Command | Artifact | Notes |
| --- | --- | --- |
| `npm run build` | `lib/index.js` | the host half, ESM, with `@deepseek-ai/cordis` kept external |
| | `lib/client.js` | the browser half, bundled for the shell's module-table dialect (`window.__ModuleLoader__`) |
| | `lib/preview.js` | the self-test preview, an IIFE; double-click `preview/index.html` and it runs |

**`lib/` is committed, so a change under `src/` should carry the rebuilt `lib/` with it** — publishing rebuilds through `prepack`, which keeps the committed copy in step with `src/`.

After a source change: the browser half is **hot**, while the host half loads once when the engine process starts — replacing the host half means restarting the engine, not reloading the page.

#### The self-test preview page

`preview/index.html` mounts the **real modules** on a simulated shell: the same stylesheet, the same applier, the same status band, the same signal reading. It needs **no engine, no profile and no sign-in** to show the palette, switch shells, change the accent, simulate a reasoning turn and check the contrast ratios. It is not a copy of the product — it is a page carrying the product's token names and a few documented hooks.

```bash
npm run build && open preview/index.html
```

#### Tests

**270 cases across 12 files, all green** (`npm test`). A good part of them are **negative assertions**: no generated class names; no radial gradients, background blur, blend modes or noise; the dark blocks must come after the light ones; the state colours and the toast / tooltip / diff tokens must not be taken over; `--dsw-alias-label-primary-inverted` must not be rewritten; neither switch state may reuse the product's own colour; corners may only be 2 / 4 / 8; the primary button must go through the accent; and a badge must never become dark-on-dark. Others are measured assertions on the contrast floors: the accent's text-safe step (including the re-check after quantisation), the text and grey ladders of both shells, and every stop of both gradient ramps.

## FAQ

**Installed it, but nothing changed.**
First check that the `dsh-trae-skin` row is switched on in the Plugins page, then make sure the page has been reloaded. The host half loads only once, when the engine process starts, so if you have just replaced the host half, the DSH engine itself is what needs restarting.

**Why is the accent not the reference's `#32f08c` when it is used as text?**
`#32f08c` is only 1.82:1 on white paper, below the AA 4.5:1 floor. The skin keeps the contrast, so that step is computed (with the default accent, `#1c864e` in the light shell at 4.60:1; the dark shell still uses `#32f08c` at 13.11:1). Copying the original value exactly would mean accepting links below AA in the light shell.

**The status band is covered by something.**
The product's own opaque full-window overlays sit at a `z-index` of 100 or more, and the band is at `z-index: 4`: the skin does not force its way through. When something covers the band, it stays covered.

**The type does not look like the reference.**
The skin **ships no font files**; it only declares font stacks, so the actual glyphs come from the fonts installed on the machine, and it falls back from there.

**How do I upgrade?**
The plugin does not update itself. On the GitHub route, remove the row and install the new version (`dsh plugin --profile web remove dsh-trae-skin`, then `add` again). On the local `link:` route, update the code in the working directory, run `npm run build` to rebuild `lib/`, and run `node scripts/install-profile.mjs` again (it is idempotent). Either way, **restart the engine** afterwards to replace the host half.

## Trade-offs

**Which two layers the reference gives.** The dark shell comes from `trae.cn`'s own site layer (`:root`, with no theme attribute — the page a visitor sees). The light shell comes from that design system's light block (`.solo-theme[data-theme=light]`): the site has no light mode, so the light shell here is assembled from its own light tokens.

**Three light-shell values had their lightness moved along the reference's own hues, because its light block does not clear the floor on white paper** (this is not a second palette):

| Role | Reference light | Here | Why |
| --- | --- | --- | --- |
| Tertiary text | `#8a9096` | `#6f757b` | 3.23:1 → 4.66:1, so caption text passes AA |
| Brand fill | `#0fdc78` | `#0a9c52` | 1.82:1 → 3.57:1, without which a button is not even legible as a shape on white paper |
| Gradient stops | `#0ac27b #0ecd70 #06c179 #63c5b1` | `#078856 #09874a #048755 #408073` | 2.07–2.36:1 → 4.50–4.61:1; the wordmark is rendered as text (`background-clip: text`) |

**Trade-offs taken:**

- **The send button's glyph.** The product draws that arrow with a **hard-coded white literal** (its own comment explains why: white type over the blue info fill). The skin replaces the fill with the accent, so the glyph has to move with it — done through two things only: the composer card this plugin is documented to hook, and the control's own accessibility contract (icon-only, opens no popup, its only child is the glyph). No generated class names. If the product's markup changes, this rule **misses and falls back to the product's own white** rather than breaking.
- **The band is covered by the product's opaque full-window overlays** (the band is `z-index: 4`, those overlays 100 and up): the skin does not force its way through.
- **No bold monospace.** The reference's 400 / 500 / 600 all point at one Regular file, so it has no bold monospace, and this skin does not fake one.
- **In follow mode, uninstalling leaves the product's last `data-ds-dark-theme` behind**: that attribute belongs to the product's theme runtime.
- **With the band off, the card also disables “Content only”**: a switch about a band that does not exist should say so, not remember a value for later.
- **The card's corners are 6 / 8px, not the page's 2 / 4 / 8px**: the page (the layer the skin replaces) keeps the reference's scale, while the card is a form inside the product's page and lines up with the series' other card.

**Deliberately not done**: the grid and pointer-follow behind the main display area, the depth veil it brings, and the three mode tints; plus radial gradients / glows, `backdrop-filter`, blend modes and noise (those four appear 0 times across the reference site, and tests assert each one stays out).

## Contributing

- For an issue, include your DSH version, your system and the steps to reproduce; a screenshot helps for anything visual.
- For a pull request, keep the tests green (`npm test`) and commit the rebuilt `lib/` alongside any change under `src/`.
- One change does one thing; no unrelated refactoring.

## License

MIT, see [LICENSE](LICENSE). The third-party packages the host half inlines (`@deepseek-ai/schemastery`, `@deepseek-ai/cosmokit`, `@standard-schema/spec`, all MIT) are credited in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and appended to the artifact by `build.mjs`.

Visual reference: [`trae.cn`](https://www.trae.cn/). Host platform: [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Sibling plugin: [`dsh-mimo-skin`](https://github.com/RonnyJung2021/dsh-mimo-skin) (the two install independently and neither depends on the other). Changes are logged in [CHANGELOG.md](CHANGELOG.md).
