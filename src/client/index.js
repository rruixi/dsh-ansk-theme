// 爱祥 (Anon × Sakiko) — 皮肤主入口。
// 契约：lib/client.js 经 window.__ModuleLoader__.load({id, factory}) 注册，factory 返回 module.exports。
// 重要：exports 必须与官方皮肤同形——仅含普通数据属性 apply（无 __esModule、无 getter、无多余导出），
// 否则 cordis 加载器在 boot 期的插件激活链路上行为不一致（实测：模块物化但 apply 不被调用）。
// 因此本文件用 CJS 风格 `module.exports = { apply }` 收尾，esbuild 以 format=cjs 打包时原样保留。

import { SKIN_CSS, CSS_TAG } from "../skin.css.js";
import { buildChrome } from "../chrome.js";
import { startBranding } from "../brand.js";
import { createBgLayer } from "../bg-layer.js";
import { registerSettings } from "../settings-ui.js";

/** 皮肤固定的产品标题（DocumentTitle settle 后接管）。 */
const SKIN_TITLE = "爱祥 · DeepSeek 在线";
/** 状态栏 cells（spacer 将左右分组）。 */
const STATUS_CELLS = ["ANSK 01", "吉他 × 钢琴", "已连接", "在线"];
/** 标题栏装饰窗口按钮（aria-hidden 纯装饰）。 */
const TITLEBAR_GLYPHS = ["—", "□", "×"];

/** 幂等注入 CSS（官方 bundle 同款 data-plugin-css 机制）。 */
function injectCss() {
  if (document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "@linxin666/dsh-client-ui-skin-ansk";
  tag.dataset.pluginCss = CSS_TAG;
  tag.textContent = SKIN_CSS;
  document.head.appendChild(tag);
}

/**
 * apply(ctx) — 皮肤挂载。
 * 注意 ctx.effect 语义：effect(cb, label) 会【立即执行】cb，并把 cb 的【返回值】作为 disposer。
 * 官方皮肤模式：ctx.effect(() => () => { ...清理... }, label) —— 内层函数才是 disposer。
 * boot 时 ctx 是完整 cordis 上下文（含 slots）；皮肤中心 try-on 时是 miniCtx（仅 effect）——
 * 设置面板注册需防御 ctx.slots 缺失。
 * @param {{ effect(cb: () => void, label?: string): void }} ctx
 */
function apply(ctx) {
  const body = document.body;
  // 防重复挂载：同一页面 apply 两次时直接空转（disposer 由调用方管理）。
  if (body.dataset.dshAnsk !== undefined) {
    ctx.effect(() => () => {}, "ui-skin-ansk: already-mounted noop");
    return;
  }

  injectCss();
  body.dataset.dshAnsk = "";

  const disposeChrome = buildChrome({
    title: SKIN_TITLE,
    cells: STATUS_CELLS,
    titlebarGlyphs: TITLEBAR_GLYPHS
  });
  // 品牌标加工：deepseek/HARNESS 白色主体 + HARNESS 文字粉蓝渐变。
  const disposeBranding = startBranding();
  // 背景图层：独立 fixed div，位置/大小/图源可调（设置面板 + 上传持久化）。
  const bgLayer = createBgLayer();
  // 设置面板「爱祥背景」区块（boot 上下文含 slots 时注册；try-on miniCtx 自动跳过）。
  const disposeSettings = registerSettings(ctx, bgLayer);

  // 返回 disposer：皮肤卸载（切肤/试穿退出）时执行。
  ctx.effect(() => () => {
    disposeChrome();
    disposeBranding();
    bgLayer.dispose();
    if (disposeSettings) disposeSettings();
    delete body.dataset.dshAnsk;
  }, "ui-skin-ansk: chrome");
}

// CJS 收尾：esbuild format=cjs 会原样保留该赋值，产物 exports 与官方皮肤同形（仅 apply 一个普通属性）。
module.exports = { apply };
