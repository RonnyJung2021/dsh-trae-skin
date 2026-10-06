/**
 * The row's schema, as the Loader resolves it before the plugin starts.
 *
 * Every field carries its default, so the published value is always complete and the
 * browser half never has to guess. The ten page knobs are volatile — saving them
 * writes the profile patch — while `enabled` and `globalName` are deployment
 * configuration: both are read once, when the row activates, and stay out of the
 * card.
 */

import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_ACCENT,
  DEFAULT_GLOBAL_NAME,
  DEFAULT_PULSE,
  DEFAULT_PULSE_COLOR,
  DEFAULT_PULSE_OPACITY,
  DEFAULT_PULSE_PERIOD_MS,
  DEFAULT_PULSE_SCALE,
  DEFAULT_SCHEME,
  DEFAULT_STRIP,
  DEFAULT_STRIP_BARE,
  DEFAULT_WORDMARK,
  PULSE_OPACITY_MAX,
  PULSE_OPACITY_MIN,
  PULSE_PERIOD_MAX_MS,
  PULSE_PERIOD_MIN_MS,
  PULSE_SCALE_MAX,
  PULSE_SCALE_MIN,
  WORDMARK_MAX_LENGTH,
} from '../constants/plugin.ts'
import { SCHEMES, type TraeScheme } from '../enums/scheme.ts'
import type { TraeConfig } from '../types/config.ts'

/** Row config, as the Loader resolves it before the plugin starts. */
export interface Config extends TraeConfig {
  /** Which shell to paint; `auto` follows the product's own light/dark state. */
  readonly scheme: TraeScheme
  /** Accent as a fill, `#rrggbb`. */
  readonly accent: string
  /** Text on the status band's plate. */
  readonly wordmark: string
  /** Whether the top status band is painted at all. */
  readonly strip: boolean
  /** Whether that band drops its own fill and its foot rule. */
  readonly stripBare: boolean
  /** Whether the indicator light breathes while the product reports reasoning. */
  readonly pulse: boolean
  /** Glow colour: `follow` derives it from the accent, or a `#rrggbb` literal. */
  readonly pulseColor: string
  /** Glow spread as a multiple of the light's own radius. */
  readonly pulseScale: number
  /** One breath, in milliseconds. */
  readonly pulsePeriodMs: number
  /** Peak opacity of the glow. */
  readonly pulseOpacity: number
  /** Whether the skin publishes at all. */
  readonly enabled: boolean
  /** Global name the browser half reads; defaults to `__DSH_TRAE_SKIN__`. */
  readonly globalName?: string
}

/** The row's schema, built from the one list of accepted scheme choices. */
export const Config = z.object({
  scheme: z.union([...SCHEMES]).default(DEFAULT_SCHEME)
    .description('整页用哪套 Trae 外壳：参照站的近黑页、它的浅色对应面，或跟随产品自己的明暗设置。').volatile(),
  accent: z.string().default(DEFAULT_ACCENT)
    .description('强调色，写成 #rrggbb；当文字渲染的那一档、12% 的底色与两套渐变都从它派生。').volatile(),
  wordmark: z.string().default(DEFAULT_WORDMARK)
    .description(`顶部状态带字标上的文字，最多 ${WORDMARK_MAX_LENGTH} 个字符。`).volatile(),
  strip: z.boolean().default(DEFAULT_STRIP)
    .description('是否画顶部那条状态带，默认开。').volatile(),
  stripBare: z.boolean().default(DEFAULT_STRIP_BARE)
    .description('条带是否只留内容：不画自己的底、不压下边线，只剩字标与指示灯。').volatile(),
  pulse: z.boolean().default(DEFAULT_PULSE)
    .description('产品报告推理时，指示灯是否做呼吸脉冲。').volatile(),
  pulseColor: z.string().default(DEFAULT_PULSE_COLOR)
    .description('光晕扩散的颜色：follow 跟随当前强调色派生，也可以直接填 #rrggbb。').volatile(),
  pulseScale: z.number().min(PULSE_SCALE_MIN).max(PULSE_SCALE_MAX).default(DEFAULT_PULSE_SCALE)
    .description(`扩散大小，按指示灯半径的倍数算（${PULSE_SCALE_MIN}–${PULSE_SCALE_MAX}）。`).volatile(),
  pulsePeriodMs: z.number().min(PULSE_PERIOD_MIN_MS).max(PULSE_PERIOD_MAX_MS).default(DEFAULT_PULSE_PERIOD_MS)
    .description(`一次呼吸的周期，单位毫秒（${PULSE_PERIOD_MIN_MS}–${PULSE_PERIOD_MAX_MS}）。`).volatile(),
  pulseOpacity: z.number().min(PULSE_OPACITY_MIN).max(PULSE_OPACITY_MAX).default(DEFAULT_PULSE_OPACITY)
    .description(`光晕强度（${PULSE_OPACITY_MIN}–${PULSE_OPACITY_MAX}）。`).volatile(),
  enabled: z.boolean().default(true)
    .description('是否发布这套皮肤配置；关掉等于本行不注入，页面回落到产品自带外壳。'),
  globalName: z.string().default(DEFAULT_GLOBAL_NAME)
    .description('宿主写进页面的全局名，一般不用改。'),
})
