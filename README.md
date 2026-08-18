# 爱祥皮肤工程（Anon × Sakiko, BanG Dream! It's MyGO!!!!!）

DSH Web GUI 主题皮肤：爱音粉 `#ff9ec7` × 祥子蓝 `#6fa8ff` 撞色渐变；音符/星星/吉他拨片/钢琴键 SVG；标题栏 + 状态栏 chrome；品牌标白色 + HARNESS 粉蓝渐变字；侧边栏/对话区/细节面板整体美化；亮/暗双主题。

- 皮肤 id：`ansk`，包名 `@linxin666/dsh-client-ui-skin-ansk`
- 内置 3 张背景图（bg / 共演 / 校服白衬衫），设置面板可上传多张、排序、重命名
- 设置 → 爱祥背景：背景图位置/大小、界面透明度（5 档）、图库管理

## 快速安装（新 dsh 用户）

### 方式一：一键脚本（推荐，Windows）

解压 `dsh-ansk-theme.zip`，在该目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
# 指定 profile：powershell -ExecutionPolicy Bypass -File .\install.ps1 -Profile web
```

脚本自动完成：装入皮肤包（dsh-skins 载具 + 包名链接，无载具则装独立包）→ 皮肤中心注册表补丁（列表可见）→ 写入 `cordis.patch.yml` 激活爱祥 → 刷新页面（**Ctrl+F5**）生效。

### 方式二：手动

1. 把 `dist/` 内容复制到 `<harness-home>/profiles/<profile>/node_modules/@linxin666/dsh-skins/skins/ansk/`（无 dsh-skins 则复制为 `.../node_modules/@linxin666/dsh-client-ui-skin-ansk/`）
2. 建包名链接（载具方式需要）：`New-Item -ItemType Junction -Path "...\node_modules\@linxin666\dsh-client-ui-skin-ansk" -Target "...\node_modules\@linxin666\dsh-skins\skins\ansk"`
3. 刷新页面（Ctrl+F5）→ 设置 → 皮肤中心 → 爱祥 → Apply（若列表无爱祥卡片，则把 `install.ps1` 里的注册表补丁段手动执行，或直接以 API 激活：`POST /api/skin-center/apply {"skin":"ansk"}`）

### 安装后

- 设置 → 皮肤中心 → 爱祥：试穿 / 应用 / 切回
- 设置 → 爱祥背景：位置、大小、界面透明度、上传多图（自动压缩）、图库选择/排序/重命名/删除、恢复默认

## 从源码构建（自定义）

```sh
npm install          # 一次即可（esbuild）
node build.mjs       # 产出 dist/
```

背景图规则：`assets/` 下所有 .jpg/.png/.webp 自动入库（中文名支持，`raw/` 子目录与 `bg-dark.*` 除外）；新图放进后重新构建并重放 dist 即可。

## 目录

```
src/art.js          内联 SVG 美术（音符、星星、拨片、钢琴键、favicon）
src/skin.css.js     样式（body[data-dsh-ansk] 作用域，亮/暗）
src/chrome.js       标题栏/状态栏/favicon DOM 构建与拆除
src/client/index.js apply(ctx) 主入口（bodyAttr / effect / disposer）
build.mjs           构建脚本（esbuild → __ModuleLoader__.load 协议包装 → dist/）
dist/               构建产物 = 组装好的皮肤包
assets/             后补图片放置处（当前为空）
```

## 构建

```sh
npm install          # 一次即可（esbuild）
node build.mjs       # 产出 dist/
```

## 安装（已装，重装/换图后重放）

```sh
# 1. 复制到载具
Copy-Item -Recurse -Force dist\* C:\Users\A\.dsh\profiles\web\node_modules\@linxin666\dsh-skins\skins\ansk\
# 2. 建包名 junction（已存在则跳过）
New-Item -ItemType Junction -Path C:\Users\A\.dsh\profiles\web\node_modules\@linxin666\dsh-client-ui-skin-ansk -Target C:\Users\A\.dsh\profiles\web\node_modules\@linxin666\dsh-skins\skins\ansk
# 3. 刷新浏览器页面即生效（配置 watcher 已热载入）
```

## 换背景图（后补路径）

把图放到 `assets/bg.jpg`（16:9、≥1920×1080、JPG 质量约 80、主体偏左/右留白、避免图中文字），
然后扩展 `build.mjs` 的 base64 内嵌段（在 `src/skin.css.js` 的 body 背景中加入
`background-image:url("data:image/jpeg;base64,...")`），重新构建 + 重放安装。
可选：`assets/bg-dark.jpg`（暗色专用）、`assets/preview-{light,dark}.png`（640×360 预览缩略图，写入 skin.json preview 字段）。

## 回滚

- 恢复皮肤中心注册表：`lib/client.js.bak-ansk` → `lib/client.js`
- 恢复激活状态：`cordis.patch.yml.bak-ansk` → `cordis.patch.yml`（watcher 秒级热载入）
- 或调接口切回：`POST /api/skin-center/apply {"official":true}`

## 关键机制备忘

- 皮肤中心列表 = skin-center `client.js` 内编译期注册表（已追加 ansk 条目，备份在 `.bak-ansk`）。
- 激活 = profile `cordis.patch.yml` managed 区段（ansk insert + 其余 disabled）。
- 运行时注册表 = host 扫描 `@linxin666/dsh-skins/skins/*/skin.json`（junction 会被跳过，故皮肤必须放载具内）。
- 缩写统一：`ANSK`（标题栏徽标「ANSK 01」、状态栏首 cell「ANSK 01」）。

## 背景图与内置图库（推荐：构建期内嵌）

**新图放进 `assets\` 目录 → 重新构建 → 设置里直接选**，这是最稳的引入方式（绕开浏览器上传的格式兼容问题）：

```
assets\
├── bg.jpg          ← 默认背景（第一张，必填）
├── 任意名字.jpg     ← 第二张、第三张……（支持 .jpg/.png/.webp，数量不限）
```

构建时 `scanAssets()` 扫描 assets 下**所有图片**内嵌为图库，`src/generated/bg.js` 生成
`BG_IMAGES` 数组（文件名作为 id/显示名，bg 排第一）。重新构建：

```sh
node build.mjs
# 复制 dist/ 到载具（见「安装」小节），刷新浏览器
```

设置 → 爱祥背景 → 「内置图库」区块出现每张图的按钮，点选即切换（localStorage 记忆，
刷新/重启保留）。暗色主题统一用当前选中图 + 深色遮罩。

## 背景设置面板（设置 → 爱祥背景）

皮肤在官方设置面板注册了独立区块（`settings.section`，id `ansk-bg`），**换图、调参全部在此完成**：

| 功能 | 说明 |
| --- | --- |
| 背景图位置 | 滑块 0–100%，默认 45%（50% = 居中，越小越靠上），实时生效 |
| 背景图大小 | 滑块 100–300%，默认 100%（100% = 铺满宽度） |
| **背景图库** | 上传图 + 内置图统一缩略图网格：点击即应用（粉蓝边框高亮）、上传图可单独删除、可传多张 |
| **上传多张图** | 每张自动 canvas 重编码（≤2560px、JPEG 85%），加入图库并可随时选择/删除；存 IndexedDB（键 `uploaded`，列表） |
| **排序** | 上传图缩略图下方 ◀/▶ 按钮前后移动，顺序持久化 |
| **重命名** | 点击上传图名称（✎）内联编辑，回车/失焦保存，长度限 40 字符 |
| 内置图库 | assets/ 内嵌的全部图片，与上传图同网格展示 |
| 恢复默认 | 清全部上传图 + 重置位置/大小/透明度/选择 |
| **界面透明度** | 5 个滑块（对话主卡片/侧边栏/细节面板/对话内容区/背景图遮罩），0–100%，实时生效 + 持久化 |

透明度机制：CSS 面板背景的 alpha 全部变量化（`--ansk-op-card` 等，作用于 body 继承到各面板），
JS 拖动滑块即写变量 + localStorage（键 `ansk.bg.ops`，JSON）。亮/暗主题共用同一透明度值。

操作反馈：成功绿条「✓ 已应用自定义背景图」；失败红条（格式不支持/文件损坏/过大——HEIC 等浏览器解不了的格式会被明确拒绝，且**绝不污染背景**）。

机制要点：
- 背景图在**独立图层** `div.anskBg`（fixed 全视口、`z-index:-1`、body 直接子节点，
  皮肤中心 try-on 还原兼容）；位置/大小/图源经 CSS 变量 `--ansk-bg-pos / --ansk-bg-size / --ansk-bg` 控制。
- 设置持久化：localStorage（位置/大小）+ IndexedDB（上传图 data URL，库 `ansk-skin` / 表 `bg` / 键 `upload`）。
- 图源优先级：**上传图 > 内嵌图（assets/bg.jpg）**；都无则隐藏图层露出纯渐变。
- 设置 UI 注册走 `ctx.get('slots')` **可选读取**——不依赖 manifest inject（宿主对包元数据
  `dsh.client` 有跨重启缓存，inject 声明改动要重启才进 boot manifest；`ctx.get` 方案
  对皮肤中心 try-on 的 miniCtx 也天然安全）。slots 由 app-shell 提供、可能晚于皮肤激活，
  注册用 200ms 轮询等待（≤15s）。React 由运行时模块系统提供（esbuild `external`）。

## 侧边栏美化锚点（当前 GUI 的稳定选择器）

CSS Modules 类名是「哈希_局部名」形态，哈希前缀跨构建会变，**后缀 `_xxx` 稳定**。皮肤 CSS 一律用后缀匹配：

| 目标 | 选择器 |
| --- | --- |
| 侧边栏列（毛玻璃粉蓝氛围 + 右边框） | `[class$='_sidebarCol']` |
| logo 横幅（粉蓝渐变） | `[class$='_sidebarCol'] [class$='_logoRow']` |
| 新建会话按钮（渐变 + 圆角 + 阴影） | `[class$='_sidebarCol'] [class$='_newSession']` |
| 会话/项目条目（圆角、hover、选中渐变 + 左侧渐变条） | `[class$='_sidebarCol'] [role=treeitem]` / `[class*='_selected']` |
| 搜索框（描边 + focus 光晕） | `[class$='_searchInput']` |
| 分区标题 | `[class$='_sectionLabel']` |
| 设置触发器 hover | `[class$='_trigger']` |
| 细节面板 + header | `[class$='_detailsCol']` / `[class$='_detailsCol'] [class$='_header']` |
| 对话区 header | `[class$='_centerCol'] [class$='_header']` |

注意：旧版 dsh-web-ui 皮肤的 `[data-pane=sidebar]` 等选择器在当前 GUI 已不存在（data-pane 已废弃），xp 的侧边栏美化实际未生效——本皮肤用的是实测 DOM 锚点。

## 两个必踩的坑（实现皮肤前先读）

1. **模块导出形态必须与官方皮肤同形**：client.js 的 factory 返回的 exports 只能是
   `{ apply }` 这种「单一普通数据属性」。用 esbuild 以 ESM `export function apply` 打包会产出
   `__toCommonJS` 包装（getter + `__esModule: true`）——实测该形态下 boot 期模块虽被物化、
   但 cordis 加载器不会调用 apply，皮肤静默不生效。正确写法：源文件末尾
   `module.exports = { apply };`（esbuild `format: "cjs"` 原样保留）。
2. **`ctx.effect` 语义**：`effect(cb, label)` 会【立即执行】cb，并把 cb 的【返回值】当作
   disposer（cordis 与皮肤中心 try-on miniCtx 同款语义）。必须写
   `ctx.effect(() => () => { 清理逻辑 }, label)` —— 内层函数才是卸载时执行的 disposer。
   若把清理逻辑直接写进 cb，皮肤会在挂载瞬间被拆掉（看起来「和默认款没区别」）。

## 布局相关禁忌（修过的 bug，务必遵守）

1. **不要给含 fixed 后代的容器加 `backdrop-filter`**：`backdrop-filter`（及 filter/transform）
   会把 fixed 定位后代的包含块从视口改绑到该容器上。ui-settings 的全视口设置面板是
   sidebarCol 的 fixed 后代——sidebarCol 加 blur 后设置窗口被钉进侧边栏（应居中）。
   `[id=root]`、`[class$='_sidebarCol']`、`[class$='_detailsCol']` 一律只用纯渐变/半透明背景。
   （状态栏 chrome 是 body 直接子节点、无 fixed 后代，可保留 backdrop-filter。）
2. **不要用通配符强制 logo 区颜色**：`BrandWordmark`（deepseek 字母/鲸鱼/HARNESS 板）的
   svg path 全部 `fill="currentColor"`。对 `[class$='_logoRow'] *` 强刷 `color:#fff` 会把
   整个品牌标刷成一块纯白（无层次）。正确做法见下方「品牌标设计」。

## 背景图（后补路径，管道已就绪）

把图放进：

```
assets/
├── bg.jpg           ← 主背景图（必填，一张即可；也支持 .png/.webp）
└── bg-dark.jpg      ← 暗色专用版（可选；缺省自动用主图 + 深色遮罩）
```

**规格**：16:9 横版、≥1920×1080（建议 2560×1440 源图）、JPG 质量约 80（体积小、内嵌快）、
人物主体偏左/右为 UI 中心留白、避免图中自带文字。

放图后执行：

```sh
node build.mjs
# 然后把 dist/ 复制到载具（见「安装」小节），刷新浏览器即生效
```

机制：build.mjs 自动把图转 base64 data URI 写入 `src/generated/bg.js`（esbuild 前生成），
皮肤 apply 时经 CSS 变量 `--ansk-bg` / `--ansk-bg-dark` 注入 body 背景最底层，
上层为氛围光 + 半透明遮罩（保可读）。无图时 `BG_IMAGE = null`，纯渐变视觉不变。
`assets/` 下无图时构建会提示 "no background image"。

## 品牌标设计（BrandWordmark 加工）

- **主体白色**：CSS `body[data-dsh-ansk] svg[viewBox='0 0 182 24']{color:#fff}` ——
  deepseek 字母、鲸鱼、HARNESS 徽章板（rect currentColor）全部白色。
- **HARNESS 文字粉蓝渐变**：SVG 无法用 CSS 渐变填充，`src/brand.js` 在运行时注入文档级
  paint server（`<linearGradient id="anskBrandGrad">`，`#ff9ec7 → #6fa8ff`），把板上文字
  path 的 `fill` 从 `var(--dsw-alias-label-primary-inverted)` 改为 `url(#anskBrandGrad)`。
- MutationObserver 监听 `svg[viewBox="0 0 182 24"]` 出现即加工（幂等，dataset 标记），
  disposer 断开观察器并全量还原（fill 改回、删除渐变 defs）。

调试手法备忘：无头 Edge + CDP（`--remote-debugging-port` + Node WebSocket）可注入
`Page.addScriptToEvaluateOnNewDocument` 拦截 `__ModuleLoader__.load` / `__DSH_MODULES__`
做全链路追踪，也可 `Page.captureScreenshot` 截真实渲染图、用 `getBoundingClientRect`
验证面板定位（居中 = x ≈ (innerWidth − width) / 2）。
