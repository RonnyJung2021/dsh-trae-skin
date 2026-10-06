<div align="center">

# dsh-trae-skin

给 DSH Web GUI 换一套外观的**纯皮肤插件** —— 近黑纸面、薄荷绿强调色、顶部渐变字标状态带、2px 直角与 0.5px 内高光的投影。

中文 / [English](README.en.md)

[安装](#安装) · [首次使用](#首次使用) · [配置](#配置) · [结构](#结构) · [开发](#开发)

<p>
  <a href="https://www.npmjs.com/package/dsh-trae-skin"><img src="https://img.shields.io/badge/version-0.2.0-blue" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="license"></a>
  <img src="https://img.shields.io/badge/DSH-%3E%3D0.1.5--rc.2-8b5cf6" alt="DSH">
  <img src="https://img.shields.io/badge/tests-270%20passing-brightgreen" alt="tests">
  <img src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933" alt="node">
</p>

</div>

***

<!-- 图片走仓库的绝对地址：npm 页面渲染 README 时解析不到相对路径，写成 docs/… 会裂成图框。 -->
<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-before.png" alt="改前：产品自带外壳" width="49%">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-dark.png" alt="改后：套上皮肤（深色）" width="49%">
</p>

同一台引擎、同一个页面：**左**是产品自己的外壳，**右**是套上皮肤之后。两张都是从真引擎、真浏览器上截的，不是示意图。

## 这是什么

它把 DSH Web GUI 换成 [`trae.cn`](https://www.trae.cn/) 的样子。**不新增任何业务功能，只改外观**：侧栏、消息区、输入卡片、菜单、代码块一起换，深浅两套外壳都能用。给想让 DSH 变成近黑纸 + 薄荷绿这套深色优先设计的人用。

### 实际表现

| 项 | 值 |
| --- | --- |
| 产物体积 | `lib/index.js` 45.7 KB / `lib/client.js` 76.7 KB |
| 改写的产品 token | 93 个（92 个 `--dsw-*` alias ＋ `--ds-font-family-code`） |
| 皮肤自己的变量 | 42 个 `--dsh-trae-*` |
| 打包资源 / 运行时依赖 | **0**（不带字体文件、不带图片；`@deepseek-ai/cordis` 由引擎提供，`schemastery` 等 MIT 代码在构建时内联进 `lib/index.js`） |
| 单测 | 270 项，12 个文件，约 0.2 s 跑完 |

## 主要功能

### 整页换肤

只经产品有文档的 `--dsw-*` alias token 换色，不改页面结构、不碰生成的 CSS-module 类名。

| 部位 | 深色 | 浅色 | 来自参照站的什么 |
| --- | --- | --- | --- |
| 页面底色 | `#0a0b0d` | `#ffffff` | `--bg-bg-base-default` / 浅色块 `base` |
| 抬升面（菜单、代码块） | `#121314` | `#fafafa` | `--bg-bg-base-secondary` / `card` |
| 正文 | `#f5f9fe` | `#1a1a1a` | `--text-text-default` |
| 次级 / 三级文字 | `#a6aab5` / `#787d87` | `#5b6066` / `#6f757b` | `--text-text-secondary` / `tertiary` |
| 三档发丝线 | 6% / 12% / 18% 白 | `#4d6b991f` / `2e` / `5c` | `--border-border-neutral-l1…l3` |
| 四档墨色叠加 | `#edeff20a` … `2e` | `#5663770f` … `33` | `--bg-bg-overlay-l1…l4` |

### 三档配色：深色 / 浅色 / 跟随产品

**默认深色**：参照站是深色优先的产品（`color-scheme:dark`，没有浅色模式），跟随产品会在浅色系统上给出一套它并不认识的设计。跟随模式下产品切明暗，皮肤跟着重画，明暗开关仍在用户手里。改完**当场重画**，不用刷新页面。

<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-light.png" alt="浅色外壳" width="100%">
</p>

**状态色故意不接管**：警示 / 成功 / 错误、toast、tooltip、diff 底色、语法高亮都留给产品按 `body[data-ds-dark-theme]` 自己切。

### 一个输入框 → 一整套安全色

只填一个 `#rrggbb`（默认参照站的品牌绿 `#32f08c`），皮肤派生：填充色、hover 深一档、12% 信息底色、当文字用的可读色、两套渐变色。

- 当文字那一档自动到 **WCAG AA 4.5:1**，对的是它真正会被读到的那张纸（浅色对白纸、深色对近黑纸）；派生值先量化成 `#rrggbb` 再复验一次 —— 四舍五入本身就能把 4.50 拉到 4.48。
- 默认色实测：浅色下当文字 `#1c864e`（4.60:1）、深色下 `#32f08c`（13.11:1）。
- 渐变跟着换：默认色用参照站自己的四段值（深色 `#3ee1a3 #32f08c #60f2bd #a0fde7`，浅色另有一套）；自定义色按**同样节奏**派生（节奏是照两套原版量出来的 HSL 偏移）。
- **卡片上印实测值**：「派生色值」一栏把两套外壳下的派生色与实测对比度都印出来，是数字不是承诺。

<!-- TODO: 截图 —— 「派生色值」读数那一栏的特写。 -->

### 顶部状态带

固定一条 32px 的带子，内容从左到右：**指示灯 → 渐变字标 → 给读屏的状态文字**。

- **渐变字标**：等宽小字、四段渐变，底下垫着同一条渐变的 16% 底衬（参照站的渐变标签版式）；内容可改，默认 `DEEPSEEK HARNESS`，1–24 字符，超长**拒绝**而不是截断。
- **指示灯**：空闲是一个圈，输入框获得焦点或鼠标移入时填实。
- **只在推理时呼吸**：产品报告推理 / 回答正在进行时才做呼吸脉冲；**读不到 `data-streaming` 信号时改成持续呼吸**（一个静止的点读起来像「没在工作」）。信号取自产品自己的属性，观察者只监听这一个属性，读数**每回合变两次**，不跟着 token 流跑。
- **整条可以关掉**（只剩配色与字体），也可以**只留内容**（不画自己的底、不压下边线）。
- **无障碍**：整条声明为 `role="status"`，状态文字（空闲 / 进行中）只给读屏看。
- 条带是**只读显示**：上面没有任何可点的东西；它声明产品的 `data-window-drag`，所以桌面壳里顶部仍能拖窗。

<!-- TODO: 截图 —— 状态带的特写（空闲圈 / 推理中呼吸两态）。 -->

### 细节修饰

| 项 | 做法 |
| --- | --- |
| 主按钮 | 参照站的行动按钮：`#32f08c` 填充 ＋ 近黑字 |
| 圆角 | 只用 2 / 4 / 8px（`2px` 是主力），没有 6 / 10 / 16px 这类中间值 |
| 分隔线 | 统一 1px，用参照站的三档 alpha |
| 投影 | 0.5px 内高光 ＋ 柔和投影；浅色下换成修正过的重量 |
| 字体 | 界面平台字体打头（Inter 作第一回退）、标题显示字体、字标与代码等宽（JetBrains Mono 打头）；**不带字体文件** |
| 开关 | 两个状态都从皮肤色系取：开是强调色，关是发丝线 |
| 版本徽标 | 侧栏徽标统一成「深色面上的字」：浅色外壳近黑底白字，深色外壳反过来，永不暗底暗字 |
| 滚动条 / 焦点环 / 链接 | 跟着皮肤走；焦点环是 1px 中性描边、偏移 2px，**不是品牌色**（品牌色留给状态） |
| 明确不做 | 径向渐变 / 辉光、`backdrop-filter`、混合模式、噪点 —— 四条在参照站全站出现 0 次，有测试逐条断言不许出现 |

### 插件卡片设置面板

侧栏 **插件 → dsh-trae-skin**，卡片下面是这个插件**自己的设置页**，十项外观分两处：卡片主体五项（**配色、强调色、字标文字、顶部状态带、条带只留内容**），「呼吸灯」分组里五项（**指示灯呼吸、光晕颜色、扩散大小、呼吸周期、光晕强度**）。

- **呼吸灯自成一块**：光晕扩散颜色（跟随强调色 / 指定颜色）、扩散大小、呼吸周期、光晕强度都在这一组里，不挤进条带那几项。
- 一颗**「恢复默认」**把所有外观项写回默认。
- **保存才生效**：编辑过程中不写回；保存前先校验，不合法就不让存，字段下面直接说明哪里不行。
- **改完当场重画**；**改动能留住**：写进 profile 配置，换端口、重启引擎、桌面窗口与面板之间切换都还在。
- 卡片会说清状态：不可写时给提示；识别到引擎里跑的是旧宿主半边时，直接告诉你该重启的是**引擎**而不是刷新页面。
- 条带关掉时，呼吸与呼吸灯那两块在卡片上是**禁用态**，而不是悄悄记下来等以后用。

<p align="center">
  <img src="https://raw.githubusercontent.com/RonnyJung2021/dsh-trae-skin/main/docs/preview-card.png" alt="插件卡片设置面板" width="100%">
</p>

卡片的排版语言与同系列的另一支皮肤插件（`dsh-mimo-skin`）刻意保持一致：同一个说明框、同一套 84px 标签列、同样的读数行与脚注 —— 两支插件各自独立安装、互不依赖，但两个设置页看上去是一个系列。

## 安装

### 环境要求

| 项 | 要求 |
| --- | --- |
| DSH | `dsh-v0.1.5-rc.2` 起，向后兼容（与同系列 `dsh-mimo-skin` 同一个下限） |
| Node.js | `^22.19.0 \|\| >=24.0.0`（只有本机自己构建时才需要） |
| 系统 | 跟随 DSH Web GUI：macOS / Windows / Linux 都行 |

### 方式一：命令

```bash
# 从 GitHub 装：仓库里带着构建好的 lib/，装的人不需要本机再构建
dsh plugin --profile web add https://github.com/RonnyJung2021/dsh-trae-skin

# 发布到 npm 之后也可以按包名装
dsh plugin --profile web add dsh-trae-skin
```

> **GitHub 直装靠的是仓库里那份 `lib/`，别改成「装完再构建」。** pnpm 默认拒绝执行 git 依赖的
> 构建脚本（`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`），除非本机在 profile 的
> `pnpm-workspace.yaml` 里把包加进 `allowBuilds`，而那个键要一字不差地抄 pnpm 打印出来的
> 形式。所以构建产物入库、构建挂在 `prepack` 上，git 安装既不用构建也不用放行。

### 方式二：插件页

侧栏 **插件** → **Add plugin** → 填 `dsh-trae-skin`（或上面那个 GitHub 地址）→ **Install** →
装完点 **Enable now**。

### 本机开发时从工作目录装

```bash
node scripts/install-profile.mjs --home /path/to/home              # 装
node scripts/install-profile.mjs --home /path/to/home --dry-run    # 只打印将改动什么
node scripts/install-profile.mjs --home /path/to/home --uninstall  # 卸
```

`--home` 默认取 `$DSH_HOME` 或 `~/.dsh`，`--profile` 默认 `web`；那个 profile 得先跑过一次引擎（`profiles/web/package.json` 存在）才装得进去。

它写三样东西（都是「插件」页自己会写的那三样）：profile `package.json` 的 `link:` 依赖与 `dsh.profile.bundles` 里的包名、`node_modules/<包名>` 软链、`pnpm-lock.yaml` 的 importer 条目；顺带清掉老的 `file://` 式 `insert` 行（否则插件会被加载两次），每个被改的文件先备份成 `*.bak-dsh-trae-skin`。重复跑是幂等的。

装成 bundle 即在 bundle 层生效；「插件」页里 `dsh-trae-skin` 那一行是它的开关与卸载入口。

> **宿主半边只在引擎启动时加载一次。** 装完、改完 `cordis.patch.yml`、升级插件之后，要重启的是**引擎**；浏览器半边是热更的（刷新页面即可）。卡片检测到引擎里跑的还是旧宿主半边时会直说。

### 首次使用

1. 按上面任一种方式装上并**启用**。
2. 打开 GUI：侧栏 **插件 → 已安装 → dsh-trae-skin**，卡片下面就是这个插件**自己的设置页**。
3. 改外观项，点 **保存**；页面立刻重画。

### 卸载

```bash
# GitHub / npm 装的
dsh plugin --profile web remove dsh-trae-skin

# 本机 link: 装的那条路
node scripts/install-profile.mjs --home /path/to/home --uninstall
```

或在「插件」页对这个包点 **卸载**。卸载后样式表、状态带、呼吸灯与写进 body 的调色板一起消失，页面回到产品自带外壳，**不留残余**。

## 配置

十项外观，全部可选，省略即用默认值，非法值逐字段回退 —— 皮肤坏掉不该拖住 GUI 启动。

| 项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `scheme` | `dark` \| `light` \| `auto` | `dark` | 配色外壳；`auto` 跟随产品自己的明暗设置 |
| `accent` | `#rgb` / `#rrggbb` | `#32f08c` | 强调色（填充用）；当文字、12% 底色与两套渐变都从它派生 |
| `wordmark` | string 1–24 | `DEEPSEEK HARNESS` | 状态带上那行渐变字；超长**拒绝**而不是截断 |
| `strip` | boolean | `true` | 是否画顶部状态带 |
| `stripBare` | boolean | `false` | 条带是否只留内容（不画底、不压下边线） |
| `pulse` | boolean | `true` | 产品报告推理时是否呼吸 |
| `pulseColor` | `follow` / `#rrggbb` | `follow` | 光晕扩散颜色；`follow` 跟随强调色派生 |
| `pulseScale` | number 1.2–2.4 | `1.6` | 扩散大小，按指示灯半径的倍数算 |
| `pulsePeriodMs` | number 800–4000 | `1600` | 一次呼吸的周期（毫秒） |
| `pulseOpacity` | number 0.1–0.6 | `0.35` | 光晕强度 |
| `enabled` | boolean | `true` | 皮肤是否渲染（部署项，不在卡片里） |
| `globalName` | string | `__DSH_TRAE_SKIN__` | 宿主写进页面的全局名（部署项，不在卡片里） |

写在 profile 的 patch 里（`profiles/web/cordis.patch.yml`）：

```yaml
- insert:
    - id: dsh-trae-skin
      name: dsh-trae-skin
      config:
        scheme: dark                 # dark | light | auto
        accent: '#32f08c'            # 任意 #rrggbb
        wordmark: DEEPSEEK HARNESS   # 1–24 字符
        strip: true
        stripBare: false
        pulse: true
        pulseColor: follow           # follow | '#rrggbb'
        pulseScale: 1.6
        pulsePeriodMs: 1600
        pulseOpacity: 0.35
        enabled: true
```

卡片保存时写的是 `- id: dsh-trae-skin` 加 `config:` 的普通 override（不是 `insert`），也就是「插件」页自己写的那种形式。

## 结构

```
dsh-trae-skin/
├── src/
│   ├── constants/     身份、卡片字段表、DOM 名、调色板与 token 映射表
│   ├── enums/         配色、外壳、活动读数、设置表单的闭集
│   ├── types/         两份半边共用的形状
│   ├── utils/         颜色运算、强调色派生、配置窄化、卡片 section
│   ├── host/          宿主半边：发布设置、设置命名空间、schema
│   ├── client/        浏览器半边：样式表、applier、状态带、信号读数、卡片
│   └── preview/       自测预览页的入口（真实模块 + 模拟外壳）
├── locale/            zh / en 两份文案
├── lib/               构建产物（index.js 宿主、client.js 浏览器、preview.js 预览），入库
├── preview/           自测预览页（双击 index.html 就能看）
├── test/              单测
├── docs/              截图
└── scripts/           装 / 卸到某个 profile
```

### 两个半边

| 半边 | 做什么 | 为什么这么分 |
| --- | --- | --- |
| 宿主（`lib/index.js`，很薄） | 把设置随首页注入表推到页面上（页面第一帧就拿到完整一份）、把外观字段做成设置命名空间（卡片才能把改动落进 profile）、把本行挡在自动设置页之外 | loader 行的 `config` 到不了页面（boot 图只带 id/inject/external）；卡片的写入又只能经设置服务落进 profile |
| 浏览器（`lib/client.js`） | 装样式表、写调色板、挂状态带与呼吸灯、订阅卡片改动即时重画 | 皮肤没有时间轴、没有会话状态，只需要设置 |

宿主半边**不注册路由、不需要 web server、不带任何打包资源**。浏览器半边**拿不到宿主的值就用自带默认值**（注入表缺失 / 不可读时页面照常显示）。

产品侧只碰它有文档的钩子：`data-composer-card`、`data-menu-material`、控件自己发布的 `role` / `aria-checked`、`data-ds-dark-theme`、`data-streaming`，以及 `body` / `#root`；**不依赖任何生成的 CSS-module 类名**，有测试逐条钉住。

### 兼容性

- 纯面向 DSH，不做跨宿主兼容；兼容下限 `dsh-v0.1.5-rc.2`，从这一版起向后兼容 —— 与同系列 `dsh-mimo-skin` 相同（两个半边调用的引擎接口是同一套：`webserver/index-inject` 注入表、`settings.configure`、客户端模块表）。
- 已知限制见下面的[已知取舍](#已知取舍)。

### 开发

```bash
npm install          # 装构建期依赖（esbuild + schemastery）
npm run build        # 一条命令构建两个半边 + 预览页
npm run watch        # 同上，带 --watch
npm test             # 单测
```

| 命令 | 产物 | 说明 |
| --- | --- | --- |
| `npm run build` | `lib/index.js` | 宿主半边，ESM，`@deepseek-ai/cordis` 保持外部 |
| | `lib/client.js` | 浏览器半边，包成壳的模块表方言（`window.__ModuleLoader__`） |
| | `lib/preview.js` | 自测预览页，IIFE，双击 `preview/index.html` 就能跑 |

**`lib/` 入库，改完 `src/` 请把重建后的 `lib/` 一起提交** —— 发布时走 `prepack` 重建，所以入库的这份要与 `src/` 同步。

改源码后：浏览器半边是**热更**的，宿主半边只在引擎进程启动时加载一次 —— 换宿主半边要重启引擎，不是刷新页面。

#### 自测预览页

`preview/index.html` 把**真实模块**挂在一个模拟外壳上：同一份样式表、同一个 applier、同一条状态带、同一个信号读数，**不用引擎、不用 profile、不用登录**就能看调色板、切深浅、改强调色、模拟一次推理、验算对比度。它不是产品的复刻 —— 它只是一个带着产品 token 名与几个已文档化钩子的页面。

```bash
npm run build && open preview/index.html
```

#### 单测

**270 项，12 个文件全绿**（`npm test`），其中一批是**反向断言**：不得出现生成式类名、不得出现径向渐变 / 背景模糊 / 混合模式 / 噪点、深色块必须排在浅色块之后、状态色与 toast / tooltip / diff token 不得被接管、`--dsw-alias-label-primary-inverted` 不得被改写、开关两个状态都不得沿用产品原色、圆角只能是 2 / 4 / 8、主按钮必须走强调色、徽标不得变成暗底暗字。另有覆盖对比度下限的实测断言：强调色当文字的那一档（含量化后复验）、两套外壳的文字 / 灰度阶梯、两套渐变的每一段。

## FAQ

**装完界面没变？**
先看「插件」页里 `dsh-trae-skin` 这一行是不是打开的；再确认页面已经刷新。宿主半边只在引擎进程启动时加载一次，如果刚换过宿主半边，要重启的是 DSH 引擎本身。

**为什么强调色当文字时不是参照站的 `#32f08c`？**
`#32f08c` 在白纸上只有 1.82:1，低于 AA 的 4.5:1。皮肤选择保住对比度，所以文字那一档是算出来的（默认浅色 `#1c864e`，4.60:1；深色仍用 `#32f08c`，13.11:1）。想完全照搬原值，就得接受浅色下链接对比度掉到 AA 以下。

**顶部状态带被弹层盖住了？**
产品的自绘不透明整窗覆盖层用的 `z-index` 在 100 以上，条带是 `z-index: 4`：皮肤不去强穿它。要盖住条带时，那就让它盖着。

**字体看起来不像参照站？**
皮肤**不带字体文件**，只声明字体栈，实际字形由这台机器已装的字体决定；没装时往回退。

**怎么升级？**
插件不自动更新。GitHub 装的那条路：删掉这一行再装一次新的（`dsh plugin --profile web remove dsh-trae-skin`，再 `add`）。本机 `link:` 装的那条路：更新工作目录里的代码并 `npm run build` 重建 `lib/`，再重跑一次 `node scripts/install-profile.mjs`（幂等）。两条路最后都要**重启引擎**换掉宿主半边。

## 已知取舍

**参照的是哪两层**：`trae.cn` 的官网层（`:root`，无主题属性，就是访客看到的那一页）给深色外壳；它的设计系统浅色块（`.solo-theme[data-theme=light]`）给浅色外壳 —— 那个站没有浅色模式，所以浅色是本插件按它自己的浅色 token 拼出来的。

**浅色外壳有三处按参照站的色相调过明度，因为它自己的浅色块在白纸上不达标**（不是另起一套）：

| 角色 | 参照站浅色 | 这里 | 为什么 |
| --- | --- | --- | --- |
| 三级文字 | `#8a9096` | `#6f757b` | 3.23:1 → 4.66:1，让说明文字过 AA |
| 品牌填充 | `#0fdc78` | `#0a9c52` | 1.82:1 → 3.57:1，否则按钮在白纸上根本看不出是个形状 |
| 渐变四段 | `#0ac27b #0ecd70 #06c179 #63c5b1` | `#078856 #09874a #048755 #408073` | 2.07–2.36:1 → 4.50–4.61:1；字标是当文字渲染的（`background-clip: text`） |

**已知取舍**：

- **发消息圆钮的字形**：产品用**写死的白色字面量**画那个箭头（它自己的注释说明了原因：白字压在蓝色 info 填充上）。皮肤把填充换成了强调色，所以也得把字形一起换 —— 用的是「输入卡这个已文档化钩子 ＋ 控件自己的可达性契约（纯图标、不展开弹出层、唯一子节点就是字形）」这两条，没有生成式类名。产品的标记将来若变，这条规则会**失配退回产品自己的白色**，不会坏掉。
- **条带会被自绘的不透明整窗覆盖层盖住**（条带 `z-index: 4`，产品的弹层用 100 以上）：皮肤不强穿。
- **不带粗体等宽**：参照站的 400 / 500 / 600 指向同一个 Regular 文件，所以它没有粗体等宽，本皮肤也不伪造一个。
- **「跟随产品」模式拆卸时留着产品最后一次的 `data-ds-dark-theme`**：那个属性归产品的主题运行时所有。
- **条带关掉时，卡片也禁用「条带只留内容」**：一个关于「并不存在的带子」的开关，同样应该说明而不是记着。
- **卡片的圆角用 6 / 8px，不是页面的 2 / 4 / 8px**：页面（被皮肤换掉的那层）守参照站的档位，卡片是产品页面里的一个表单，跟同系列插件的卡片对齐。

**明确不做**：主显示区背后的方格与鼠标跟随、它带来的那层深度纱层、模式色调三档；以及径向渐变 / 辉光、`backdrop-filter`、混合模式、噪点（后四条在参照站全站出现 0 次，测试逐条断言不许出现）。

## 贡献

- 提 issue 请附上 DSH 版本、系统、复现步骤；界面问题带截图更好。
- 提 PR 请保持单测全绿（`npm test`），改了 `src/` 就一并提交重建后的 `lib/`。
- 一处改动只做一件事，不加与本次无关的重构。

## 许可

MIT，见 [LICENSE](LICENSE)。宿主半边内联的第三方包（`@deepseek-ai/schemastery`、`@deepseek-ai/cosmokit`、`@standard-schema/spec`，均 MIT）其许可声明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，由 `build.mjs` 附加到产物末尾。

视觉参考 [`trae.cn`](https://www.trae.cn/)；宿主平台 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)；同系列插件 [`dsh-mimo-skin`](https://github.com/RonnyJung2021/dsh-mimo-skin)（两支各自独立安装、互不依赖）。改动记录见 [CHANGELOG.md](CHANGELOG.md)。
