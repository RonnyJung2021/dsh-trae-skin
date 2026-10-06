(() => {
  // src/constants/config.ts
  var STRIP_HEIGHT = 32;
  var LIGHT_RADIUS = 4;

  // src/constants/palette.ts
  var DARK_SHELL = {
    id: "dark",
    page: "#0a0b0d",
    raised: "#121314",
    terrace: "#1c1c1d",
    ink: "#f5f9fe",
    muted: "#a6aab5",
    faint: "#787d87",
    ruleL1: "#ffffff0f",
    ruleL2: "#ffffff1f",
    ruleL3: "#ffffff2e",
    overlayL1: "#edeff20a",
    overlayL2: "#edeff214",
    overlayL3: "#edeff221",
    overlayL4: "#edeff22e",
    invert: "#edeff2",
    invertHover: "#ffffff",
    invertActive: "#0b0b0a",
    onAccent: "#0a0b0d",
    textDirection: "lighten",
    // `--bg-bg-overlay-l4` and `--border-border-neutral-l3`, the site's own pair.
    scrollThumb: "#edeff22e",
    scrollThumbHover: "#ffffff2e",
    elevationStroke: "#ffffff2e",
    // `--shadow-elevation` on the site's activity cards and menu surfaces.
    elevation: "inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 4px 8px 0 rgb(0 0 0 / 30%)",
    elevationSoft: "inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 2px 8px 0 rgb(0 0 0 / 32%)",
    elevationProminent: "inset 0 0.5px 0 0 rgb(255 255 255 / 6%), 0 16px 32px 0 rgb(0 0 0 / 40%)",
    shadowLv1: "0 2px 8px 0 rgb(0 0 0 / 32%)",
    shadowLv1Blur: "0 4px 12px 0 rgb(0 0 0 / 32%)",
    shadowLv3: "0 16px 32px 0 rgb(0 0 0 / 40%)",
    gradientStops: ["#3ee1a3", "#32f08c", "#60f2bd", "#a0fde7"]
  };
  var LIGHT_SHELL = {
    id: "light",
    page: "#ffffff",
    raised: "#fafafa",
    terrace: "#ffffff",
    ink: "#1a1a1a",
    muted: "#5b6066",
    faint: "#6f757b",
    ruleL1: "#4d6b991f",
    ruleL2: "#4d6b992e",
    ruleL3: "#4d6b995c",
    overlayL1: "#5663770f",
    overlayL2: "#5663771a",
    overlayL3: "#56637724",
    overlayL4: "#56637733",
    invert: "#36393d",
    invertHover: "#585b5f",
    invertActive: "#1a1b1d",
    onAccent: "#0c0c0d",
    textDirection: "darken",
    scrollThumb: "#56637733",
    scrollThumbHover: "#4d6b995c",
    elevationStroke: "#4d6b995c",
    // The reference keeps its dark recipe here, where a white highlight does
    // nothing; the corrected weight swaps it for a 4% black one and a lighter drop.
    elevation: "inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 4px 8px 0 rgb(0 0 0 / 12%)",
    elevationSoft: "inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 2px 8px 0 rgb(0 0 0 / 8%)",
    elevationProminent: "inset 0 0.5px 0 0 rgb(0 0 0 / 4%), 0 16px 32px 0 rgb(0 0 0 / 12%)",
    shadowLv1: "0 2px 8px 0 rgb(0 0 0 / 8%)",
    shadowLv1Blur: "0 4px 12px 0 rgb(0 0 0 / 8%)",
    shadowLv3: "0 16px 32px 0 rgb(0 0 0 / 8%)",
    gradientStops: ["#078856", "#09874a", "#048755", "#408073"]
  };
  var SHELLS = { dark: DARK_SHELL, light: LIGHT_SHELL };
  var GRADIENT_RHYTHM = {
    // Measured off #3ee1a3 / #32f08c / #60f2bd / #a0fde7.
    dark: [
      { dh: 8.8, ds: -13.3, dl: -0.6 },
      { dh: 0, ds: 0, dl: 0 },
      { dh: 9.8, ds: -1.5, dl: 9.4 },
      { dh: 17.4, ds: 9.5, dl: 24.1 }
    ],
    // Measured off #0ac27b / #0ecd70 / #06c179 / #63c5b1.
    light: [
      { dh: 6.1, ds: 3, dl: -2.9 },
      { dh: 0, ds: 0, dl: 0 },
      { dh: 6.1, ds: 6.8, dl: -3.9 },
      { dh: 17, ds: -41.4, dl: 15.1 }
    ]
  };
  var GRADIENT_POSITIONS = ["0", "36%", "71.63%", "100%"];
  var PLATE_ALPHA = 0.16;
  var WASH_ALPHA = 0.12;
  var HOVER_DARKEN = 0.18;
  var DISABLED_ALPHA = 0.3;
  var FONT_STACKS = {
    /** Interface text: platform face first, Inter as the reference's own first fallback. */
    ui: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    /** Headings: the reference's `--font-family-heading`, an SF Pro Display-first stack. */
    display: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    /** Wordmark and code: the reference's `--font-family-mono`, JetBrains Mono first. */
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  };
  var SHELL_VARIABLES = {
    page: "--dsh-trae-page",
    raised: "--dsh-trae-raised",
    terrace: "--dsh-trae-terrace",
    ink: "--dsh-trae-ink",
    muted: "--dsh-trae-muted",
    faint: "--dsh-trae-faint",
    ruleL1: "--dsh-trae-rule-l1",
    ruleL2: "--dsh-trae-rule-l2",
    ruleL3: "--dsh-trae-rule-l3",
    overlayL1: "--dsh-trae-overlay-l1",
    overlayL2: "--dsh-trae-overlay-l2",
    overlayL3: "--dsh-trae-overlay-l3",
    overlayL4: "--dsh-trae-overlay-l4",
    invert: "--dsh-trae-invert",
    invertHover: "--dsh-trae-invert-hover",
    invertActive: "--dsh-trae-invert-active",
    onAccent: "--dsh-trae-on-accent",
    scrollThumb: "--dsh-trae-scroll-thumb",
    scrollThumbHover: "--dsh-trae-scroll-thumb-hover",
    elevationStroke: "--dsh-trae-elevation-stroke",
    elevation: "--dsh-trae-elevation",
    elevationSoft: "--dsh-trae-elevation-soft",
    elevationProminent: "--dsh-trae-elevation-prominent",
    shadowLv1: "--dsh-trae-shadow-lv1",
    shadowLv1Blur: "--dsh-trae-shadow-lv1-blur",
    shadowLv3: "--dsh-trae-shadow-lv3"
  };
  var DYNAMIC_VARIABLES = [
    "--dsh-trae-accent",
    "--dsh-trae-accent-hover",
    "--dsh-trae-accent-disabled",
    "--dsh-trae-accent-text",
    "--dsh-trae-accent-wash",
    "--dsh-trae-gradient",
    "--dsh-trae-gradient-plate",
    "--dsh-trae-pulse-color",
    "--dsh-trae-pulse-scale",
    "--dsh-trae-pulse-period",
    "--dsh-trae-pulse-opacity"
  ];
  var ALIAS_MAP = [
    // Grounds.
    ["--dsw-alias-bg-base", "var(--dsh-trae-page)"],
    ["--dsw-alias-bg-layer-1", "var(--dsh-trae-page)"],
    ["--dsw-alias-bg-layer-2", "var(--dsh-trae-raised)"],
    ["--dsw-alias-bg-layer-3", "var(--dsh-trae-raised)"],
    ["--dsw-alias-bg-overlay", "var(--dsh-trae-page)"],
    ["--dsw-alias-bg-module-platform", "var(--dsh-trae-raised)"],
    ["--dsw-alias-bg-multi-select", "var(--dsh-trae-raised)"],
    ["--dsw-alias-bg-skeleton", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-bg-document-preview", "var(--dsh-trae-raised)"],
    ["--dsw-specific-sidebar-fill", "var(--dsh-trae-page)"],
    ["--dsw-specific-input-major", "var(--dsh-trae-page)"],
    ["--dsw-specific-bubble", "var(--dsh-trae-raised)"],
    ["--dsw-specific-selector", "var(--dsh-trae-raised)"],
    ["--dsw-specific-tip", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-specific-login-input", "var(--dsh-trae-page)"],
    ["--dsw-specific-bubble-highlight", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-specific-sidebar-nav-item-hover", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-specific-sidebar-nav-item-active", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-specific-sidebar-nav-item-active-accent", "var(--dsh-trae-accent-text)"],
    // Floating surfaces. The reference paints its menus with the page colour and a
    // 1px third-step hairline, which is also what keeps the product's own translucent
    // blur invisible: an opaque fill over it leaves nothing to blur.
    ["--dsw-menu-surface-fill", "var(--dsh-trae-page)"],
    ["--dsw-specific-menu", "var(--dsh-trae-page)"],
    ["--dsw-alias-menu-group-header-fill", "var(--dsh-trae-page)"],
    ["--dsw-alias-menu-icon", "var(--dsh-trae-muted)"],
    ["--dsw-alias-settings-card-fill", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-settings-card-stroke", "var(--dsh-trae-rule-l1)"],
    // Markdown and code surfaces.
    ["--dsw-alias-markdown-code-block", "var(--dsh-trae-raised)"],
    ["--dsw-alias-markdown-code-block-banner", "var(--dsh-trae-terrace)"],
    ["--dsw-alias-markdown-code-segment-selected", "var(--dsh-trae-raised)"],
    ["--dsw-alias-markdown-code-segment-unselected", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-markdown-inline-code", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-alias-markdown-tag", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-alias-markdown-citation", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-alias-markdown-placeholder", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-turn-trigger-bg", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-turn-trigger-bg-hover", "var(--dsh-trae-overlay-l2)"],
    // Rules. The reference draws every separator as 1px at one of three alphas.
    ["--dsw-alias-border-l1", "var(--dsh-trae-rule-l1)"],
    ["--dsw-alias-border-l2", "var(--dsh-trae-rule-l2)"],
    ["--dsw-alias-border-l2-darkmode-thin", "var(--dsh-trae-rule-l1)"],
    ["--dsw-alias-border-l3", "var(--dsh-trae-rule-l3)"],
    ["--dsw-alias-border-l4", "var(--dsh-trae-rule-l3)"],
    // Ink.
    ["--dsw-alias-label-primary", "var(--dsh-trae-ink)"],
    ["--dsw-alias-label-primary-dimmed", "var(--dsh-trae-ink)"],
    ["--dsw-alias-label-primary-bluish", "var(--dsh-trae-ink)"],
    ["--dsw-alias-label-primary-foreground", "var(--dsh-trae-on-accent)"],
    ["--dsw-alias-label-secondary", "var(--dsh-trae-muted)"],
    ["--dsw-alias-label-tertiary", "var(--dsh-trae-faint)"],
    ["--dsw-alias-label-caption", "var(--dsh-trae-faint)"],
    ["--dsw-alias-label-dimmed", "var(--dsh-trae-faint)"],
    ["--dsw-alias-label-document-preview", "var(--dsh-trae-muted)"],
    // The accent, spent the way the reference spends it: its primary call to action
    // is a mint fill with a near-black label, so the fill and the label on it move as
    // one pair.
    ["--dsw-alias-brand-primary", "var(--dsh-trae-accent)"],
    ["--dsw-alias-brand-primary-new-colorprimary-new-color", "var(--dsh-trae-accent)"],
    ["--dsw-alias-brand-text", "var(--dsh-trae-accent-text)"],
    ["--dsw-alias-link", "var(--dsh-trae-accent-text)"],
    ["--dsw-alias-button-primary-fill", "var(--dsh-trae-accent)"],
    ["--dsw-alias-button-primary-hover", "var(--dsh-trae-accent-hover)"],
    ["--dsw-alias-button-primary-dimmed", "var(--dsh-trae-accent-disabled)"],
    ["--dsw-alias-button-info-fill", "var(--dsh-trae-accent)"],
    ["--dsw-alias-button-info-hover", "var(--dsh-trae-accent-hover)"],
    ["--dsw-alias-state-business-primary", "var(--dsh-trae-accent)"],
    ["--dsw-alias-state-business-tertiary", "var(--dsh-trae-accent-wash)"],
    // The reference's other two button weights: an inverted fill, and quiet ones
    // that answer the pointer with an ink wash.
    ["--dsw-alias-button-contrast-fill", "var(--dsh-trae-invert)"],
    ["--dsw-alias-button-elevated-fill", "var(--dsh-trae-page)"],
    ["--dsw-alias-button-floating-fill", "var(--dsh-trae-raised)"],
    ["--dsw-alias-button-floating-hover", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-button-ghost-active-fill", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-alias-button-ghost-active-hover", "var(--dsh-trae-overlay-l3)"],
    ["--dsw-alias-button-ghost-active-border", "var(--dsh-trae-rule-l2)"],
    ["--dsw-alias-interactive-bg-hover", "var(--dsh-trae-overlay-l1)"],
    ["--dsw-alias-interactive-bg-active", "var(--dsh-trae-overlay-l3)"],
    ["--dsw-alias-interactive-bg-hover-solid", "var(--dsh-trae-overlay-l2)"],
    ["--dsw-alias-interactive-bg-hover-accent", "var(--dsh-trae-accent-wash)"],
    // Scrollbars: the reference's own two-step thumb, per shell.
    ["--dsw-alias-scrollbar-bg-l1", "var(--dsh-trae-scroll-thumb)"],
    ["--dsw-alias-scrollbar-bg-l2", "var(--dsh-trae-scroll-thumb)"],
    ["--dsw-alias-scrollbar-hover-l1", "var(--dsh-trae-scroll-thumb-hover)"],
    ["--dsw-alias-scrollbar-hover-l2", "var(--dsh-trae-scroll-thumb-hover)"],
    // Depth: the reference's own recipes, top to bottom.
    ["--dsw-elevation-stroke-color", "var(--dsh-trae-elevation-stroke)"],
    ["--dsw-shadow-lv1", "var(--dsh-trae-shadow-lv1)"],
    ["--dsw-shadow-lv1-blur", "var(--dsh-trae-shadow-lv1-blur)"],
    ["--dsw-shadow-lv2", "var(--dsh-trae-elevation)"],
    ["--dsw-shadow-lv3", "var(--dsh-trae-shadow-lv3)"],
    ["--dsw-linear-gradient-think", "var(--dsh-trae-think)"],
    ["--dsw-linear-think-select", "var(--dsh-trae-think-select)"]
  ];
  var FONT_VARIABLES = [
    ["--dsh-trae-font-ui", FONT_STACKS.ui],
    ["--dsh-trae-font-display", FONT_STACKS.display],
    ["--dsh-trae-font-mono", FONT_STACKS.mono]
  ];
  var CHROME_VARIABLES = [
    ["--dsw-radius-xs", "2px"],
    ["--dsw-radius-sm", "4px"],
    ["--dsw-radius-md", "4px"],
    ["--dsw-radius-lg", "8px"],
    ["--dsw-radius-xl", "8px"],
    ["--dsw-radius-panel", "8px"],
    ["--dsw-font-family", "var(--dsh-trae-font-ui)"],
    ["--dsw-font-family-brand", "var(--dsh-trae-font-display)"],
    ["--ds-font-family-code", "var(--dsh-trae-font-mono)"],
    ["--dsw-focus-ring-width", "1px"],
    ["--dsw-focus-ring-color", "var(--dsh-trae-faint)"]
  ];

  // src/constants/plugin.ts
  var DEFAULT_ACCENT = "#32f08c";

  // src/utils/color.ts
  var HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/iu;
  var AA_TEXT_CONTRAST = 4.5;
  var BLACK = { r: 0, g: 0, b: 0 };
  var WHITE = { r: 255, g: 255, b: 255 };
  function parseColor(value) {
    if (typeof value !== "string") return void 0;
    const text2 = value.trim();
    if (!HEX.test(text2)) return void 0;
    const digits = text2.slice(1);
    const full = digits.length === 3 ? digits.split("").map((digit) => `${digit}${digit}`).join("") : digits;
    return {
      r: Number.parseInt(full.slice(0, 2), 16),
      g: Number.parseInt(full.slice(2, 4), 16),
      b: Number.parseInt(full.slice(4, 6), 16)
    };
  }
  function toHex(color) {
    const channel = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
    return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
  }
  function quantize(color) {
    return parseColor(toHex(color)) ?? color;
  }
  function mix(from, to, amount) {
    const at = Math.min(1, Math.max(0, amount));
    return {
      r: from.r + (to.r - from.r) * at,
      g: from.g + (to.g - from.g) * at,
      b: from.b + (to.b - from.b) * at
    };
  }
  function darken(color, amount) {
    return mix(color, BLACK, amount);
  }
  function luminance(color) {
    const channel = (value) => {
      const scaled = value / 255;
      return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  }
  function contrast(a, b) {
    const first = luminance(a);
    const second = luminance(b);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function readableOn(color, page, direction, floor = AA_TEXT_CONTRAST) {
    const start = quantize(color);
    if (contrast(start, page) >= floor) return toHex(start);
    const target = direction === "darken" ? BLACK : WHITE;
    const steps = 100;
    for (let step = 1; step <= steps; step += 1) {
      const candidate = quantize(mix(start, target, step / steps));
      if (contrast(candidate, page) >= floor) return toHex(candidate);
    }
    return toHex(target);
  }
  function toHsl(color) {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const span = max - min;
    let h = 0;
    if (span !== 0) {
      if (max === r) h = (g - b) / span % 6;
      else if (max === g) h = (b - r) / span + 2;
      else h = (r - g) / span + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    const l = (max + min) / 2;
    const s = span === 0 ? 0 : span / (1 - Math.abs(2 * l - 1));
    return { h, s: s * 100, l: l * 100 };
  }
  function fromHsl(hsl) {
    const h = (hsl.h % 360 + 360) % 360;
    const s = Math.min(100, Math.max(0, hsl.s)) / 100;
    const l = Math.min(100, Math.max(0, hsl.l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = l - c / 2;
    const sector = Math.floor(h / 60) % 6;
    const [r, g, b] = [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x]
    ][sector];
    return quantize({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
  }
  function shift(color, offset) {
    const hsl = toHsl(color);
    return fromHsl({ h: hsl.h + offset.dh, s: hsl.s + offset.ds, l: hsl.l + offset.dl });
  }
  function withAlpha(color, alpha) {
    const byte = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
    return `${toHex(color)}${byte.toString(16).padStart(2, "0")}`;
  }
  function formatRatio(ratio) {
    return `${ratio.toFixed(2)}:1`;
  }

  // src/utils/accent.ts
  function isDefaultAccent(accent) {
    const parsed = parseColor(accent);
    const reference = parseColor(DEFAULT_ACCENT);
    return parsed !== void 0 && reference !== void 0 && toHex(parsed) === toHex(reference);
  }
  function accentGradient(accent, shell) {
    if (isDefaultAccent(accent)) return shell.gradientStops;
    const color = parseColor(accent);
    if (color === void 0) return shell.gradientStops;
    return GRADIENT_RHYTHM[shell.id].map((offset) => toHex(shift(color, offset)));
  }
  function accentsFor(accent, shell) {
    const fill = parseColor(accent);
    const page = parseColor(shell.page);
    if (fill === void 0 || page === void 0) {
      return {
        fill: accent,
        hover: accent,
        disabled: accent,
        text: accent,
        textRatio: 1,
        wash: accent,
        gradient: shell.gradientStops
      };
    }
    const text2 = readableOn(fill, page, shell.textDirection);
    const textColor = parseColor(text2) ?? fill;
    return {
      fill: toHex(fill),
      hover: toHex(darken(fill, HOVER_DARKEN)),
      disabled: withAlpha(fill, DISABLED_ALPHA),
      text: text2,
      textRatio: contrast(textColor, page),
      wash: withAlpha(fill, WASH_ALPHA),
      gradient: accentGradient(accent, shell)
    };
  }
  function gradientCss(stops) {
    const pairs = stops.map((stop, index) => `${stop} ${GRADIENT_POSITIONS[index] ?? "100%"}`);
    return `linear-gradient(90deg, ${pairs.join(", ")})`;
  }
  function gradientPlateCss(stops) {
    const washes = stops.map((stop) => {
      const color = parseColor(stop);
      return color === void 0 ? "transparent" : withAlpha(color, PLATE_ALPHA);
    });
    return gradientCss(washes);
  }

  // src/constants/dom.ts
  var STYLE_ID = "dsh-trae-styles";
  var SKIN_ATTRIBUTE = "data-dsh-trae";
  var SCHEME_ATTRIBUTE = "data-dsh-trae-scheme";
  var ACTIVITY_ATTRIBUTE = "data-dsh-trae-activity";
  var PULSE_ATTRIBUTE = "data-dsh-trae-pulse";
  var STRIP_ATTRIBUTE = "data-dsh-trae-strip";
  var THEME_DARK_ATTRIBUTE = "data-ds-dark-theme";
  var STREAMING_ATTRIBUTE = "data-streaming";
  var COMPOSER_ATTRIBUTE = "data-composer-card";
  var MENU_ATTRIBUTE = "data-menu-material";
  var WINDOW_DRAG_ATTRIBUTE = "data-window-drag";
  var STRIP_CLASS = "dsh-trae-strip";
  var PLATE_CLASS = "dsh-trae-strip-plate";
  var MARK_CLASS = "dsh-trae-strip-mark";
  var LAMP_CLASS = "dsh-trae-strip-lamp";
  var STATE_CLASS = "dsh-trae-strip-state";

  // src/client/activity.ts
  var RUNNING = "true";
  function readActivity(root = document) {
    const marked = root.querySelectorAll(`[${STREAMING_ATTRIBUTE}]`);
    if (marked.length === 0) return { activity: "idle", known: false };
    for (const element of marked) {
      if (element.getAttribute(STREAMING_ATTRIBUTE) === RUNNING) return { activity: "running", known: true };
    }
    return { activity: "idle", known: true };
  }
  function observeActivity(onChange, root = document) {
    let known = false;
    let current;
    function sync() {
      const reading = readActivity(root);
      if (reading.known) known = true;
      const next = known ? reading.activity : "unknown";
      if (next === current) return;
      current = next;
      onChange(next);
    }
    const scope = root.documentElement;
    const observer = new MutationObserver((records) => {
      const relevant = records.some((record) => record.type === "attributes" || [...record.addedNodes].some((node) => node.nodeType === 1 && node.hasAttribute(STREAMING_ATTRIBUTE)));
      if (relevant) sync();
    });
    if (scope !== null) {
      observer.observe(scope, {
        attributes: true,
        attributeFilter: [STREAMING_ATTRIBUTE],
        childList: true,
        subtree: true
      });
    }
    sync();
    return {
      refresh: sync,
      destroy() {
        observer.disconnect();
        current = void 0;
        known = false;
      }
    };
  }

  // locale/en.json
  var en_default = {
    meta: {
      title: "dsh-trae-skin",
      description: "Turns the whole GUI into trae.cn: near-black paper, a mint accent, a gradient wordmark band across the top, 2px corners and 0.5px inner-highlight shadows. The shell, the accent, the wordmark and the breathing light are all edited on this plugin's own card."
    },
    strip: {
      idle: "Idle",
      busy: "Working"
    },
    panel: {
      noteReady: "These values are written into the profile's config: they survive a new port and a restart. Nothing changes until Save is pressed, and Save checks every field first.",
      noteLoading: "Reading settings\u2026",
      noteUnavailable: "This engine offers no settings transport: changes here apply to the current page only, and a new port returns to the values in the profile.",
      noteStaleHost: "The engine is still running this plugin's older host half (this page is already the new one). The host half loads once, when the engine process starts, so reloading the page cannot replace it \u2014 the engine itself has to be restarted (that interrupts a running conversation, and this page has to be reopened). After the restart these changes can be saved into the profile.",
      save: "Save",
      reset: "Restore defaults",
      stateSaved: "The saved values are the ones the page is using",
      stateDirty: "There are unsaved changes",
      stateClean: "Edit a field and Save lights up",
      stateLocked: "This form is not writable right now",
      derived: "Derived colours",
      derivedFill: "fill",
      derivedHover: "hover",
      derivedWash: "12% wash",
      derivedTextLight: "as text, light",
      derivedTextDark: "as text, dark",
      derivedGradientLight: "light ramp",
      derivedGradientDark: "dark ramp",
      pulseGroup: "Breathing light",
      stripOffNote: "The band is off, so this has no effect right now.",
      schemeDark: "Dark: near-black paper, mint ink (default)",
      schemeLight: "Light: white paper, dark green",
      schemeAuto: "Follow the product",
      pulseColorFollow: "Follow the accent (default)",
      pulseColorLiteral: "Name a colour",
      fieldScheme: "Shell",
      fieldSchemeHint: "Dark by default: the reference is a dark-first product, so following the product would show a light-system user a design it never shipped.",
      fieldAccent: "Accent",
      fieldAccentHint: "The reference green is #32f08c: a fine fill, only 1.82:1 as a link on white \u2014 the text-safe step is derived separately.",
      fieldWordmark: "Wordmark",
      fieldWordmarkHint: "The gradient line on the band, 1\u201324 characters, DEEPSEEK HARNESS by default; an over-long value is refused, not truncated.",
      fieldStrip: "Top band",
      fieldStripHint: "The fixed row at the top: the light, the gradient wordmark and the state in words for screen readers.",
      fieldStripBare: "Content only",
      fieldStripBareHint: "No fill and no foot rule, only the wordmark and the light; the page still moves down by the band\u2019s height.",
      fieldPulse: "Light breathes",
      fieldPulseHint: "Breathes only while the product reports reasoning; with no readable data-streaming signal it breathes continuously.",
      fieldPulseColor: "Glow colour",
      fieldPulseColorHint: "Follows the accent\u2019s text-safe step by default, the one read against the page.",
      fieldPulseScale: "Glow spread",
      fieldPulseScaleHint: "1.2\u20132.4, as a multiple of the light\u2019s radius; 1.6 by default.",
      fieldPulsePeriodMs: "Breath period",
      fieldPulsePeriodMsHint: "800\u20134000 ms, 1600 by default; under reduced motion it fades over the same period.",
      fieldPulseOpacity: "Glow strength",
      fieldPulseOpacityHint: "0.1\u20130.6, 0.35 by default.",
      errorScheme: "The shell is one of dark / light / follow the product.",
      errorAccent: "The accent must be written as #rgb or #rrggbb.",
      errorWordmark: "The wordmark must be 1\u201324 characters: not empty, not over-long.",
      errorPulseColor: "The glow colour is either follow or a #rgb / #rrggbb literal.",
      errorPulseScale: "The glow spread must be between 1.2 and 2.4.",
      errorPulsePeriodMs: "The breath period must be between 800 and 4000 milliseconds.",
      errorPulseOpacity: "The glow strength must be between 0.1 and 0.6."
    }
  };

  // locale/zh.json
  var zh_default = {
    meta: {
      title: "dsh-trae-skin",
      description: "\u628A\u6574\u4E2A GUI \u6362\u6210 trae.cn \u7684\u6837\u5B50\uFF1A\u8FD1\u9ED1\u7EB8\u9762\u3001\u8584\u8377\u7EFF\u5F3A\u8C03\u8272\u3001\u9876\u90E8\u6E10\u53D8\u5B57\u6807\u72B6\u6001\u5E26\u30012px \u76F4\u89D2\u4E0E 0.5px \u5185\u9AD8\u5149\u7684\u6295\u5F71\u3002\u914D\u8272\u5916\u58F3\u3001\u5F3A\u8C03\u8272\u3001\u5B57\u6807\u4E0E\u547C\u5438\u706F\u90FD\u5728\u672C\u63D2\u4EF6\u81EA\u5DF1\u7684\u5361\u7247\u91CC\u6539\u3002"
    },
    strip: {
      idle: "\u7A7A\u95F2",
      busy: "\u8FDB\u884C\u4E2D"
    },
    panel: {
      noteReady: "\u8FD9\u4E9B\u503C\u5199\u8FDB profile \u7684\u914D\u7F6E\u91CC\uFF1A\u6362\u7AEF\u53E3\u3001\u91CD\u542F\u90FD\u8FD8\u5728\u3002\u6539\u5B8C\u70B9\u300C\u4FDD\u5B58\u300D\u624D\u751F\u6548\uFF0C\u4FDD\u5B58\u524D\u4F1A\u5148\u6821\u9A8C\u3002",
      noteLoading: "\u6B63\u5728\u8BFB\u53D6\u8BBE\u7F6E\u2026",
      noteUnavailable: "\u8FD9\u53F0\u5F15\u64CE\u6CA1\u6709\u63D0\u4F9B\u8BBE\u7F6E\u63A5\u53E3\uFF1A\u8FD9\u91CC\u7684\u6539\u52A8\u53EA\u5BF9\u5F53\u524D\u9875\u9762\u6709\u6548\uFF0C\u6362\u7AEF\u53E3\u5C31\u4F1A\u56DE\u5230 profile \u91CC\u7684\u503C\u3002",
      noteStaleHost: "\u5F15\u64CE\u91CC\u8DD1\u7684\u8FD8\u662F\u672C\u63D2\u4EF6\u7684\u65E7\u5BBF\u4E3B\u534A\u8FB9\uFF08\u672C\u9875\u5DF2\u662F\u65B0\u7248\u672C\uFF09\uFF1A\u5BBF\u4E3B\u534A\u8FB9\u53EA\u5728\u5F15\u64CE\u8FDB\u7A0B\u542F\u52A8\u65F6\u52A0\u8F7D\u4E00\u6B21\uFF0C\u5237\u65B0\u9875\u9762\u6362\u4E0D\u6389\u5B83\u3002\u8981\u91CD\u542F\u7684\u662F\u5F15\u64CE\u672C\u8EAB\u2014\u2014\u505C\u6389\u518D\u91CD\u65B0\u8D77\u4E00\u6B21 DSH \u5F15\u64CE\uFF08\u4F1A\u6253\u65AD\u6B63\u5728\u8DD1\u7684\u5BF9\u8BDD\uFF0C\u672C\u9875\u8981\u91CD\u5F00\uFF09\uFF1B\u91CD\u542F\u540E\u8FD9\u91CC\u7684\u6539\u52A8\u5C31\u80FD\u5B58\u8FDB profile \u914D\u7F6E\u3002",
      save: "\u4FDD\u5B58",
      reset: "\u6062\u590D\u9ED8\u8BA4",
      stateSaved: "\u5DF2\u4FDD\u5B58\u7684\u503C\u5C31\u662F\u9875\u9762\u6B63\u5728\u7528\u7684\u503C",
      stateDirty: "\u6709\u6539\u52A8\u8FD8\u6CA1\u4FDD\u5B58",
      stateClean: "\u6539\u4E86\u5C31\u4F1A\u4EAE\u8D77\u300C\u4FDD\u5B58\u300D",
      stateLocked: "\u8FD9\u4EFD\u8868\u5355\u5F53\u524D\u4E0D\u53EF\u5199",
      derived: "\u6D3E\u751F\u8272\u503C",
      derivedFill: "\u586B\u5145",
      derivedHover: "hover",
      derivedWash: "12% \u5E95\u8272",
      derivedTextLight: "\u6D45\u8272\u4E0B\u5F53\u6587\u5B57",
      derivedTextDark: "\u6DF1\u8272\u4E0B\u5F53\u6587\u5B57",
      derivedGradientLight: "\u6D45\u8272\u6E10\u53D8",
      derivedGradientDark: "\u6DF1\u8272\u6E10\u53D8",
      pulseGroup: "\u547C\u5438\u706F",
      stripOffNote: "\u72B6\u6001\u5E26\u5173\u7740\uFF0C\u8FD9\u4E00\u9879\u73B0\u5728\u4E0D\u8D77\u4F5C\u7528\u3002",
      schemeDark: "\u6DF1\u8272\uFF1A\u8FD1\u9ED1\u7EB8 + \u8584\u8377\u7EFF\uFF08\u9ED8\u8BA4\uFF09",
      schemeLight: "\u6D45\u8272\uFF1A\u767D\u7EB8 + \u6DF1\u7EFF",
      schemeAuto: "\u8DDF\u968F\u4EA7\u54C1",
      pulseColorFollow: "\u8DDF\u968F\u5F3A\u8C03\u8272\uFF08\u9ED8\u8BA4\uFF09",
      pulseColorLiteral: "\u6307\u5B9A\u989C\u8272",
      fieldScheme: "\u914D\u8272",
      fieldSchemeHint: "\u9ED8\u8BA4\u6DF1\u8272\uFF1A\u53C2\u7167\u7AD9\u662F\u6DF1\u8272\u4F18\u5148\u7684\u4EA7\u54C1\uFF1B\u8DDF\u968F\u4EA7\u54C1\u4F1A\u5728\u6D45\u8272\u7CFB\u7EDF\u4E0A\u7ED9\u51FA\u4E00\u5957\u5B83\u6CA1\u6709\u7684\u8BBE\u8BA1\u3002",
      fieldAccent: "\u5F3A\u8C03\u8272",
      fieldAccentHint: "\u53C2\u7167\u7AD9\u7684\u54C1\u724C\u7EFF #32f08c \u505A\u586B\u5145\u591F\uFF0C\u5728\u767D\u7EB8\u4E0A\u5F53\u94FE\u63A5\u53EA\u6709 1.82:1\uFF0C\u5F53\u6587\u5B57\u90A3\u4E00\u6863\u53E6\u7B97\u5230\u8FBE\u6807\u3002",
      fieldWordmark: "\u5B57\u6807\u6587\u5B57",
      fieldWordmarkHint: "\u72B6\u6001\u5E26\u4E0A\u90A3\u884C\u6E10\u53D8\u5B57\uFF0C1\u201324 \u5B57\u7B26\uFF0C\u9ED8\u8BA4 DEEPSEEK HARNESS\uFF1B\u8D85\u957F\u4F1A\u62D2\u7EDD\uFF0C\u4E0D\u622A\u65AD\u3002",
      fieldStrip: "\u9876\u90E8\u72B6\u6001\u5E26",
      fieldStripHint: "\u9875\u9762\u9876\u7AEF\u90A3\u6761\u56FA\u5B9A\u5E26\u5B50\uFF1A\u6307\u793A\u706F\u3001\u6E10\u53D8\u5B57\u6807\uFF0C\u4EE5\u53CA\u7ED9\u8BFB\u5C4F\u7684\u72B6\u6001\u6587\u5B57\u3002",
      fieldStripBare: "\u6761\u5E26\u53EA\u7559\u5185\u5BB9",
      fieldStripBareHint: "\u4E0D\u753B\u5E95\u3001\u4E0D\u538B\u4E0B\u8FB9\u7EBF\uFF0C\u53EA\u5269\u5B57\u6807\u4E0E\u6307\u793A\u706F\uFF1B\u9875\u9762\u7167\u6837\u6309\u5E26\u5B50\u9AD8\u5EA6\u4E0B\u79FB\u3002",
      fieldPulse: "\u6307\u793A\u706F\u547C\u5438",
      fieldPulseHint: "\u53EA\u5728\u4EA7\u54C1\u62A5\u544A\u63A8\u7406 / \u56DE\u7B54\u65F6\u547C\u5438\uFF1B\u8BFB\u4E0D\u5230 data-streaming \u4FE1\u53F7\u65F6\u6539\u6210\u6301\u7EED\u547C\u5438\u3002",
      fieldPulseColor: "\u5149\u6655\u989C\u8272",
      fieldPulseColorHint: "\u9ED8\u8BA4\u8DDF\u968F\u5F3A\u8C03\u8272\u6D3E\u751F\u51FA\u6765\u7684\u90A3\u4E00\u6863\uFF08\u5373\u5F53\u6587\u5B57\u7528\u7684\u90A3\u6863\uFF09\u3002",
      fieldPulseScale: "\u6269\u6563\u5927\u5C0F",
      fieldPulseScaleHint: "1.2\u20132.4\uFF0C\u6309\u6307\u793A\u706F\u534A\u5F84\u7684\u500D\u6570\u7B97\uFF0C\u9ED8\u8BA4 1.6\u3002",
      fieldPulsePeriodMs: "\u547C\u5438\u5468\u671F",
      fieldPulsePeriodMsHint: "800\u20134000 \u6BEB\u79D2\uFF0C\u9ED8\u8BA4 1600\uFF1B\u7CFB\u7EDF\u5F00\u4E86\u300C\u51CF\u5F31\u52A8\u6001\u6548\u679C\u300D\u65F6\u6539\u6210\u540C\u5468\u671F\u6DE1\u5165\u6DE1\u51FA\u3002",
      fieldPulseOpacity: "\u5149\u6655\u5F3A\u5EA6",
      fieldPulseOpacityHint: "0.1\u20130.6\uFF0C\u9ED8\u8BA4 0.35\u3002",
      errorScheme: "\u914D\u8272\u53EA\u80FD\u53D6\u300C\u6DF1\u8272 / \u6D45\u8272 / \u8DDF\u968F\u4EA7\u54C1\u300D\u4E09\u4E2A\u503C\u4E4B\u4E00\u3002",
      errorAccent: "\u5F3A\u8C03\u8272\u8981\u5199\u6210 #rgb \u6216 #rrggbb\u3002",
      errorWordmark: "\u5B57\u6807\u6587\u5B57\u8981 1\u201324 \u4E2A\u5B57\u7B26\uFF0C\u4E0D\u80FD\u4E3A\u7A7A\u4E5F\u4E0D\u80FD\u8D85\u957F\u3002",
      errorPulseColor: "\u5149\u6655\u989C\u8272\u8981\u4E48\u662F follow\uFF0C\u8981\u4E48\u5199\u6210 #rgb \u6216 #rrggbb\u3002",
      errorPulseScale: "\u6269\u6563\u5927\u5C0F\u8981\u843D\u5728 1.2 \u5230 2.4 \u4E4B\u95F4\u3002",
      errorPulsePeriodMs: "\u547C\u5438\u5468\u671F\u8981\u843D\u5728 800 \u5230 4000 \u6BEB\u79D2\u4E4B\u95F4\u3002",
      errorPulseOpacity: "\u5149\u6655\u5F3A\u5EA6\u8981\u843D\u5728 0.1 \u5230 0.6 \u4E4B\u95F4\u3002"
    }
  };

  // src/client/copy.ts
  function sectionOf(dictionary, name) {
    const section = typeof dictionary === "object" && dictionary !== null ? Reflect.get(dictionary, name) : void 0;
    return typeof section === "object" && section !== null ? section : {};
  }
  function text(section, english, key) {
    for (const source of [section, english]) {
      const value = source[key];
      if (typeof value === "string" && value !== "") return value;
    }
    return key;
  }
  function dictionaryFor(language) {
    return language.toLowerCase().startsWith("zh") ? zh_default : en_default;
  }
  function readerFor(language, name) {
    const tag = language ?? (typeof navigator === "undefined" ? "en" : navigator.language);
    const english = sectionOf(en_default, name);
    const chosen = sectionOf(dictionaryFor(tag), name);
    return (key) => text(chosen, english, key);
  }
  function stripCopy(language) {
    const read = readerFor(language, "strip");
    return { idle: read("idle"), busy: read("busy") };
  }

  // src/client/palette.ts
  function shellIdFor(scheme, documentIsDark) {
    if (scheme === "auto") return documentIsDark ? "dark" : "light";
    return scheme;
  }
  function productDarkFor(scheme) {
    if (scheme === "dark") return true;
    if (scheme === "light") return false;
    return void 0;
  }
  function stripModeFor(input2) {
    if (!input2.strip) return "off";
    return input2.stripBare ? "bare" : "full";
  }
  function fadeOf(surface) {
    return `linear-gradient(180deg, ${surface} 20.19%, ${surface}00 100%)`;
  }
  function shellDeclarations(shell) {
    const declarations2 = Object.entries(SHELL_VARIABLES).map(([field, name]) => [name, String(Reflect.get(shell, field))]);
    declarations2.push(
      ["--dsh-trae-think", fadeOf(shell.terrace)],
      ["--dsh-trae-think-select", fadeOf(shell.raised)]
    );
    return declarations2;
  }
  function shellFor(id) {
    return SHELLS[id];
  }
  function skinVariables(input2, shell) {
    const accent = accentsFor(input2.accent, shell);
    const pulseColor = input2.pulseColor === "follow" ? accent.text : input2.pulseColor;
    const pulse = input2.pulse && input2.strip;
    return {
      "--dsh-trae-accent": accent.fill,
      "--dsh-trae-accent-hover": accent.hover,
      "--dsh-trae-accent-disabled": accent.disabled,
      "--dsh-trae-accent-text": accent.text,
      "--dsh-trae-accent-wash": accent.wash,
      "--dsh-trae-gradient": gradientCss(accent.gradient),
      "--dsh-trae-gradient-plate": gradientPlateCss(accent.gradient),
      "--dsh-trae-pulse-color": pulseColor,
      "--dsh-trae-pulse-scale": String(pulse ? input2.pulseScale : 1),
      "--dsh-trae-pulse-period": `${pulse ? input2.pulsePeriodMs : 0}ms`,
      "--dsh-trae-pulse-opacity": String(pulse ? input2.pulseOpacity : 0)
    };
  }

  // src/client/skin.ts
  function setAttribute(body, name, value) {
    if (body.getAttribute(name) === value) return;
    body.setAttribute(name, value);
  }
  function setFlag(body, name, wanted) {
    if (body.hasAttribute(name) === wanted) return;
    if (wanted) body.setAttribute(name, "");
    else body.removeAttribute(name);
  }
  function createSkin(input2, doc = document) {
    let observer;
    let activity = "unknown";
    const productWasDark = doc.body?.hasAttribute(THEME_DARK_ATTRIBUTE) === true;
    function paint() {
      const body = doc.body;
      if (body === null) return;
      const shell = shellFor(shellIdFor(input2.scheme, body.hasAttribute(THEME_DARK_ATTRIBUTE)));
      for (const [name, value] of Object.entries(skinVariables(input2, shell))) {
        body.style.setProperty(name, value);
      }
      setAttribute(body, SKIN_ATTRIBUTE, "");
      setAttribute(body, SCHEME_ATTRIBUTE, shell.id);
      setAttribute(body, ACTIVITY_ATTRIBUTE, activity);
      setAttribute(body, PULSE_ATTRIBUTE, input2.pulse ? "on" : "off");
      setAttribute(body, STRIP_ATTRIBUTE, stripModeFor(input2));
      syncProductTheme(body);
    }
    function syncProductTheme(body) {
      const wanted = productDarkFor(input2.scheme);
      if (wanted === void 0) return;
      setFlag(body, THEME_DARK_ATTRIBUTE, wanted);
    }
    function watchProductTheme() {
      observer?.disconnect();
      observer = void 0;
      if (input2.scheme !== "auto" || doc.body === null) return;
      observer = new MutationObserver(() => {
        paint();
      });
      observer.observe(doc.body, { attributes: true, attributeFilter: [THEME_DARK_ATTRIBUTE] });
    }
    paint();
    watchProductTheme();
    return {
      apply() {
        paint();
        watchProductTheme();
      },
      setActivity(next) {
        if (next === activity) return;
        activity = next;
        paint();
      },
      destroy() {
        observer?.disconnect();
        observer = void 0;
        const body = doc.body;
        if (body === null) return;
        body.removeAttribute(SKIN_ATTRIBUTE);
        body.removeAttribute(SCHEME_ATTRIBUTE);
        body.removeAttribute(ACTIVITY_ATTRIBUTE);
        body.removeAttribute(PULSE_ATTRIBUTE);
        body.removeAttribute(STRIP_ATTRIBUTE);
        for (const name of DYNAMIC_VARIABLES) body.style.removeProperty(name);
        if (productDarkFor(input2.scheme) !== void 0) {
          setFlag(body, THEME_DARK_ATTRIBUTE, productWasDark);
        }
      }
    };
  }

  // src/client/strip.ts
  function createStatusBand(doc = document, copy2 = { idle: "", busy: "" }) {
    const element = doc.createElement("div");
    element.className = STRIP_CLASS;
    element.setAttribute("role", "status");
    element.setAttribute(WINDOW_DRAG_ATTRIBUTE, "");
    const lamp = doc.createElement("span");
    lamp.className = LAMP_CLASS;
    lamp.setAttribute("aria-hidden", "true");
    const plate = doc.createElement("span");
    plate.className = PLATE_CLASS;
    const mark = doc.createElement("span");
    mark.className = MARK_CLASS;
    plate.append(mark);
    const state = doc.createElement("span");
    state.className = STATE_CLASS;
    element.append(lamp, plate, state);
    const mount = doc.body;
    mount?.append(element);
    function report(activity) {
      state.textContent = activity === "idle" ? copy2.idle : copy2.busy;
    }
    report("unknown");
    return {
      setWordmark(text2) {
        mark.textContent = text2;
      },
      setActivity(activity) {
        report(activity);
      },
      destroy() {
        element.remove();
      }
    };
  }

  // src/client/styles/page.ts
  function installPageStyles(doc = document) {
    const existing = doc.getElementById(STYLE_ID);
    if (existing !== null) return () => {
    };
    const element = doc.createElement("style");
    element.id = STYLE_ID;
    element.textContent = pageStyles();
    doc.head.append(element);
    return () => {
      element.remove();
    };
  }
  function declarations(pairs, important = false) {
    const suffix = important ? " !important" : "";
    return pairs.map(([name, value]) => `  ${name}: ${value}${suffix};`).join("\n");
  }
  function pageStyles() {
    const skin2 = `body[${SKIN_ATTRIBUTE}]`;
    const radius = `${LIGHT_RADIUS}px`;
    const diameter = `${LIGHT_RADIUS * 2}px`;
    return `
/* -------------------------------------------------------------- the band -- */

.${STRIP_CLASS} {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  block-size: ${STRIP_HEIGHT}px;
  padding-inline: 16px;
  background: var(--dsh-trae-page);
  /* The reference draws every separator as a 1px line, never a thicker one. */
  border-block-end: 1px solid var(--dsh-trae-rule-l3);
  color: var(--dsh-trae-muted);
  font-family: var(--dsh-trae-font-mono);
  font-size: 12px;
  line-height: 15.6px;
  /* Read-only display: nothing on the band is clickable. */
  user-select: none;
  /* The shell subtracts every direct child of body from the window's drag region,
     and the band now owns the top of the window \u2014 so it declares its own drag
     region with the product's documented hook, and re-asserts it here because that
     subtraction is what a body child gets by default. */
  -webkit-app-region: drag !important;
}

/* Content only: the plate's fill and the foot rule go, the content stays. */
${skin2}[${STRIP_ATTRIBUTE}='bare'] .${STRIP_CLASS} {
  background: transparent;
  border-block-end-color: transparent;
}

/* The reference's own gradient-tag format: a 16% underlay of the same four stops,
   with the wordmark itself clipped out of the full-strength ramp. */
.${PLATE_CLASS} {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  max-inline-size: 60%;
  block-size: 18px;
  padding-inline: 4px;
  border-radius: 2px;
  overflow: hidden;
  background: var(--dsh-trae-gradient-plate);
}

.${MARK_CLASS} {
  font-family: var(--dsh-trae-font-mono);
  font-size: 12px;
  /* The reference's own label weight: its 400/500/600 all point at one Regular
     file, so a heavier mono face does not exist \u2014 and is not faked here either. */
  font-weight: 500;
  line-height: 15.6px;
  letter-spacing: 0.1px;
  white-space: nowrap;
  background: var(--dsh-trae-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* Idle is a ring. */
.${LAMP_CLASS} {
  position: relative;
  flex: none;
  inline-size: ${diameter};
  block-size: ${diameter};
  border-radius: 50%;
  /* The shell curves every rounded corner along a superellipse; a circle has to opt
     back out of that, or the lamp is drawn as a squircle. */
  corner-shape: round;
  border: 1px solid var(--dsh-trae-accent-text);
  background: transparent;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Filled while the composer has focus, and while the pointer is over it or over the
   band itself. Three separate rules rather than one selector list, so an engine
   without :has() still gets the band's own hover. */
${skin2} .${STRIP_CLASS}:hover .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

${skin2}:has([${COMPOSER_ATTRIBUTE}]:focus-within) .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

${skin2}:has([${COMPOSER_ATTRIBUTE}]:hover) .${LAMP_CLASS} {
  background: var(--dsh-trae-accent-text);
}

/* The glow has no size of its own until it spreads. */
.${LAMP_CLASS}::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  corner-shape: round;
  opacity: 0;
  pointer-events: none;
}

/* The glow spreads only while the product reports that it is reasoning. When the
   product publishes no streaming signal at all the reading is 'unknown', and the
   light breathes on that too: a motionless dot reads as "not working". */
${skin2}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='running'] .${LAMP_CLASS}::after,
${skin2}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='unknown'] .${LAMP_CLASS}::after {
  animation: dsh-trae-breathe var(--dsh-trae-pulse-period) cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes dsh-trae-breathe {
  0% {
    box-shadow: 0 0 0 0 var(--dsh-trae-pulse-color);
    opacity: var(--dsh-trae-pulse-opacity);
  }
  70% {
    box-shadow: 0 0 0 calc(${radius} * var(--dsh-trae-pulse-scale)) transparent;
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 0 transparent;
    opacity: 0;
  }
}

/* Same period, no travel: a stopped light reads as a frozen one, so the
   reduced-motion path fades in place instead of holding still. */
@keyframes dsh-trae-breathe-still {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: var(--dsh-trae-pulse-opacity);
  }
}

@media (prefers-reduced-motion: reduce) {
  ${skin2}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='running'] .${LAMP_CLASS}::after,
  ${skin2}[${PULSE_ATTRIBUTE}='on'][${ACTIVITY_ATTRIBUTE}='unknown'] .${LAMP_CLASS}::after {
    animation-name: dsh-trae-breathe-still;
  }

  .${LAMP_CLASS} {
    transition: none;
  }
}

/* The light's state, in words, for assistive technology. The band is a status
   region, so this is the text it announces; it is never painted. */
.${STATE_CLASS} {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ------------------------------------------------------------------ mount -- */

/* The band is a fixed layer, so the app makes room for it rather than being covered
   by it. border-box keeps the product's own height: 100% chain intact: the padding
   comes out of the box instead of extending it. */
${skin2} #root {
  box-sizing: border-box;
  padding-block-start: ${STRIP_HEIGHT}px;
}

/* Off means the band is not in the document at all, and the page closes up. */
${skin2}[${STRIP_ATTRIBUTE}='off'] #root {
  padding-block-start: 0;
}

${skin2} {
  font-family: var(--dsh-trae-font-ui);
  color: var(--dsh-trae-ink);
  background-color: var(--dsh-trae-page);
  /* The reference paints its page with a flat fill and never with an image. */
  background-image: none;
}

/* -------------------------------------------------------------- elevation -- */

/* The product declares the three elevation tiers per element (body, body *), so a
   value set on the body alone is shadowed on every descendant and inheritance
   cannot carry one. The recipe is the reference's own: a half-pixel inner highlight
   plus one soft drop, and in the light shell the corrected weight for a white
   page. */
${skin2},
${skin2} * {
  --dsw-elevation-panel: var(--dsh-trae-elevation) !important;
  --dsw-elevation-prominent: var(--dsh-trae-elevation-prominent) !important;
  --dsw-elevation-soft: var(--dsh-trae-elevation-soft) !important;
}

/* --------------------------------------------------- chrome, both shells -- */

${skin2} {
${declarations(FONT_VARIABLES)}

${declarations(CHROME_VARIABLES, true)}

${declarations(ALIAS_MAP, true)}
}

/* Form controls do not inherit a font from the document, so the interface face has
   to be named on them explicitly. */
${skin2} input,
${skin2} textarea,
${skin2} select,
${skin2} button {
  font-family: inherit;
}

/* -------------------------------------------------------------- light shell -- */

/* Written first; the dark block below is the compiled default and has to win on a
   document that somehow matches both. */
${skin2}[${SCHEME_ATTRIBUTE}='light'] {
  color-scheme: light;

${declarations(shellDeclarations(LIGHT_SHELL))}
}

/* --------------------------------------------------------------- dark shell -- */

${skin2}[${SCHEME_ATTRIBUTE}='dark'] {
  color-scheme: dark;

${declarations(shellDeclarations(DARK_SHELL))}
}

/* ------------------------------------------------ the product's own hooks -- */

/* The one documented composer hook: an opaque card with a hairline, which is the
   reference's own input card. */
${skin2} [${COMPOSER_ATTRIBUTE}] {
  background: var(--dsh-trae-raised) !important;
  border: 1px solid var(--dsh-trae-rule-l2) !important;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

${skin2} [${COMPOSER_ATTRIBUTE}]:focus-within {
  border-color: var(--dsh-trae-accent) !important;
}

/* A menu is the one surface that should read as floating paper. */
${skin2} [${MENU_ATTRIBUTE}] {
  border: 1px solid var(--dsh-trae-rule-l2) !important;
}

/* The composer's action circle paints its glyph with a **static white literal** \u2014
   the product's own stylesheet says why: white is meant to sit on the blue info
   fill. The skin moves that fill to the accent, so it has to move the glyph with
   it, or the most-clicked control in the interface would sit at 1.50:1.

   The circle is reached through the composer's documented hook, its own accessible
   contract (an icon-only button that opens no popup) and one structural fact \u2014 its
   only child is the glyph. No generated class name is involved, and the four other
   glyphs inside that card are excluded by the same two conditions: the file button
   opens a listbox, and the two pickers carry a text label beside their icon. Should
   the product's markup move, this rule stops matching and the glyph goes back to the
   product's own white rather than breaking. */
${skin2} [${COMPOSER_ATTRIBUTE}] button:has(> svg:only-child):not([aria-haspopup]) {
  color: var(--dsh-trae-on-accent);
}

/* Both states of a switch are repainted from the skin's own palette: on is the
   accent, off is the faintest hairline. The role and aria-checked attributes are
   the control's own contract \u2014 the state it already publishes to assistive
   technology \u2014 not a generated class name. */
${skin2} [role='switch'][aria-checked='true'] {
  background: var(--dsh-trae-accent) !important;
}

${skin2} [role='switch'][aria-checked='false'] {
  background: var(--dsh-trae-rule-l1) !important;
}

/* A 1px neutral ring, offset 2px. Only the geometry is set here: the colour and the
   width travel through the product's own focus tokens above, so a control that
   deliberately paints no ring keeps painting none. The brand colour is reserved for
   state and is never spent on focus. */
${skin2} :focus-visible {
  outline-offset: 2px;
}

/* Code takes the mono face, and never a bold one: the reference's 400/500/600 all
   point at a single Regular file, so a heavier mono face does not exist there. */
${skin2} code,
${skin2} kbd,
${skin2} pre,
${skin2} samp {
  font-family: var(--dsh-trae-font-mono);
  font-weight: 400;
}

@media (prefers-reduced-motion: reduce) {
  ${skin2} [${COMPOSER_ATTRIBUTE}] {
    transition: none;
  }
}
`.trim();
  }

  // src/preview/main.ts
  var input = {
    scheme: "dark",
    accent: "#32f08c",
    strip: true,
    stripBare: false,
    pulse: true,
    pulseColor: "follow",
    pulseScale: 1.6,
    pulsePeriodMs: 1600,
    pulseOpacity: 0.35
  };
  function control(id) {
    return document.getElementById(id) ?? void 0;
  }
  function derivedRow(label, value, swatch) {
    const chip = swatch === void 0 ? "" : `<span class="dshPreviewSwatch" style="background:${swatch}"></span>`;
    return `<dt>${label}</dt><dd>${chip}<code>${value}</code></dd>`;
  }
  function paintDerived() {
    const target = control("derived");
    if (target === void 0) return;
    const light = accentsFor(input.accent, LIGHT_SHELL);
    const dark = accentsFor(input.accent, DARK_SHELL);
    target.innerHTML = [
      derivedRow("fill", light.fill, light.fill),
      derivedRow("hover", light.hover, light.hover),
      derivedRow("wash 12%", light.wash, light.fill),
      derivedRow("text on white", `${light.text} (${formatRatio(light.textRatio)})`, light.text),
      derivedRow("text on near-black", `${dark.text} (${formatRatio(dark.textRatio)})`, dark.text),
      derivedRow("ramp, light", gradientCss(light.gradient)),
      derivedRow("ramp, dark", gradientCss(dark.gradient))
    ].join("");
  }
  installPageStyles(document);
  var skin = createSkin(input, document);
  var copy = stripCopy();
  var band = createStatusBand(document, copy);
  band.setWordmark("DEEPSEEK HARNESS");
  band.setActivity("unknown");
  observeActivity((activity) => {
    skin.setActivity(activity);
    band?.setActivity(activity);
  }, document);
  function readControls() {
    input.scheme = control("scheme")?.value ?? "dark";
    input.accent = control("accent")?.value.trim() ?? "#32f08c";
    input.strip = control("strip")?.checked ?? true;
    input.stripBare = control("stripBare")?.checked ?? false;
    input.pulse = control("pulse")?.checked ?? true;
    const pulseMode = control("pulseMode")?.value ?? "follow";
    input.pulseColor = pulseMode === "follow" ? "follow" : control("pulseColor")?.value.trim() || "#32f08c";
    input.pulseScale = Number(control("pulseScale")?.value ?? 1.6);
    input.pulsePeriodMs = Number(control("pulsePeriodMs")?.value ?? 1600);
    input.pulseOpacity = Number(control("pulseOpacity")?.value ?? 0.35);
    const wordmark = control("wordmark")?.value.trim() ?? "";
    if (band === void 0 && input.strip) band = createStatusBand(document, copy);
    if (band !== void 0) band.setWordmark(wordmark === "" ? "DEEPSEEK HARNESS" : wordmark);
    if (!input.strip && band !== void 0) {
      band.destroy();
      band = void 0;
    }
    skin.apply();
    paintDerived();
    document.body.dataset.dshPreviewScheme = input.scheme;
  }
  for (const id of ["scheme", "accent", "wordmark", "strip", "stripBare", "pulse", "pulseMode", "pulseColor", "pulseScale", "pulsePeriodMs", "pulseOpacity"]) {
    const element = control(id);
    element?.addEventListener("input", readControls);
    element?.addEventListener("change", readControls);
  }
  control("simulate")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const answer = document.getElementById("answer");
    const running = answer?.hasAttribute("data-streaming") === true;
    if (running) answer?.removeAttribute("data-streaming");
    else answer?.setAttribute("data-streaming", "true");
    button.textContent = running ? "\u6A21\u62DF\u4E00\u6B21\u63A8\u7406" : "\u7ED3\u675F\u8FD9\u6B21\u63A8\u7406";
  });
  paintDerived();
})();
