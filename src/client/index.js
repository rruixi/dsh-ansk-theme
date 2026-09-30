// 爱祥 (Anon × Sakiko) — 皮肤浏览器侧入口（DST Desktop 组合包 client 半边）。
//
// 契约（与官方 @deepseek-ai/dsh-client-ui-* 的 lib/client.js 同形）：
//   window.__ModuleLoader__.load({ id: <包名>, factory: (require) => exports });
//   factory 返回的 exports 里：
//     - apply(ctx)  插件挂载函数（ctx 是 cordis 客户端上下文）
//     - inject      cordis 服务依赖清单（客户端服务名，如 'slots' / 'locale'）
//   require('react') 走客户端 seed 模块表（client-modules 的 staticModules），
//   不内联第二份 React，也不依赖宿主额外声明。
//
// 关键语义：
//   ctx.effect(cb, label) 立即执行 cb，并把 cb 的【返回值】当作 disposer。
//   因此清理逻辑必须写成 ctx.effect(() => () => { ... }, label)。
//   所有 DOM/CSS/观察器/定时器都在 apply 内注册，卸载时全量还原。
//
// 皮肤由三部分组成：
//   1) 全局 CSS（<style data-plugin-css>，作用域 body[data-dsh-ansk] 与
//      html[data-dsh-ansk]，亮/暗双套）
//   2) body 直接子节点的装饰层：标题栏 / 状态栏 / 背景图层 / SVG 渐变 defs
//      （都不含 fixed 面板后代，不会影响宿主 fixed 定位层）
//   3) 设置 → 「爱祥背景」页（注册进 settings.section 槽）

import { SKIN_CSS, CSS_TAG } from "../skin.css.js";
import { buildChrome } from "../chrome.js";
import { startBranding } from "../brand.js";
import { createBgLayer } from "../bg-layer.js";
import { registerSettings } from "../settings-ui.js";

/** 皮肤固定的产品标题（favicon 与 document.title）。 */
const SKIN_TITLE = "爱祥 · DeepSeek Harness";
/** 状态栏 cells（spacer 将左右分组）。 */
const STATUS_CELLS = ["ANSK 01", "吉他 × 钢琴", "已连接", "在线"];
/** 标题栏装饰窗口按钮（aria-hidden 纯装饰）。 */
const TITLEBAR_GLYPHS = ["—", "□", "×"];

/** cordis 客户端服务依赖：slots（注册设置页）+ locale（界面文案）。 */
const inject = ["slots", "locale"];

const SETTINGS_NS = "ansk";

/** 界面文案词典（设置页标签等）；中英各一份，随语言偏好切换。 */
const DICT = {
  zh: {
    "nav": "爱祥背景",
    "bg.pos": "背景图位置",
    "bg.pos.hint": "当前 {v}%（50% = 居中，越小越靠上）",
    "bg.size": "背景图大小",
    "bg.size.hint": "当前 {v}%（100% = 铺满宽度，越大越放大）",
    "gallery": "背景图库",
    "gallery.hint": "点击缩略图应用；上传的图存于本机浏览器，可随时删除",
    "upload": "上传新图",
    "reset": "恢复默认",
    "opacity": "界面透明度",
    "opacity.hint": "值越大越不透明；0 = 完全透明（透出背景图）",
    "ok.uploaded": "已添加并应用该背景图",
    "err.upload": "上传失败，请重试（JPG/PNG/WebP 格式）",
    "op.card": "对话主卡片",
    "op.sidebar": "侧边栏",
    "op.rightbar": "细节面板",
    "op.center": "对话内容区",
    "op.scrim": "背景图遮罩"
  },
  en: {
    "nav": "Anon × Sakiko",
    "bg.pos": "Background position",
    "bg.pos.hint": "Now {v}% (50% = centered, smaller = higher)",
    "bg.size": "Background size",
    "bg.size.hint": "Now {v}% (100% = full width, larger = zoomed)",
    "gallery": "Background gallery",
    "gallery.hint": "Click a thumbnail to apply; uploads stay in this browser and can be deleted anytime",
    "upload": "Upload image",
    "reset": "Reset to defaults",
    "opacity": "Panel opacity",
    "opacity.hint": "Higher = more opaque; 0 = fully transparent (background shows through)",
    "ok.uploaded": "Background added and applied",
    "err.upload": "Upload failed, please retry (JPG/PNG/WebP)",
    "op.card": "Conversation card",
    "op.sidebar": "Sidebar",
    "op.rightbar": "Details panel",
    "op.center": "Conversation area",
    "op.scrim": "Background scrim"
  }
};

/** 幂等注入皮肤 CSS（官方 bundle 同款 data-plugin-css 去重机制）；返回移除函数。 */
function injectCss() {
  const existing = document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`);
  if (existing !== null) return () => {};
  const tag = document.createElement("style");
  tag.dataset.plugin = "ansk-skin";
  tag.dataset.pluginCss = CSS_TAG;
  tag.textContent = SKIN_CSS;
  document.head.appendChild(tag);
  return () => tag.remove();
}

/**
 * apply(ctx) — 皮肤挂载。
 * @param {import('@deepseek-ai/cordis').Context} ctx 客户端 cordis 上下文（含 slots / locale）
 */
function apply(ctx) {
  const body = document.body;
  // 防重复挂载：同一文档 apply 两次时直接空转（disposer 由调用方管理）。
  if (body.dataset.dshAnsk !== undefined) {
    ctx.effect(() => () => {}, "ui-skin-ansk: already-mounted noop");
    return;
  }

  const removeCss = injectCss();
  body.dataset.dshAnsk = "";
  const root = document.documentElement;
  root.dataset.dshAnsk = "";

  // 界面文案：注册词典 + 绑定命名空间（语言切换自动生效）。
  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh: DICT.zh, en: DICT.en }), "ui-skin-ansk: locale");
  const t = ctx.locale.bind(SETTINGS_NS);

  const disposeChrome = buildChrome({
    title: SKIN_TITLE,
    cells: STATUS_CELLS,
    titlebarGlyphs: TITLEBAR_GLYPHS
  });
  // 品牌标加工：deepseek/HARNESS 白色主体 + HARNESS 文字粉蓝渐变。
  const disposeBranding = startBranding();
  // 背景图层：独立 fixed div，位置/大小/图源可调（设置面板 + 上传持久化）。
  const bgLayer = createBgLayer();
  // 设置面板「爱祥背景」页（settings.section 槽）。
  const disposeSettings = registerSettings(ctx, bgLayer, t);

  ctx.effect(() => () => {
    disposeSettings();
    disposeChrome();
    disposeBranding();
    bgLayer.dispose();
    removeCss();
    delete body.dataset.dshAnsk;
    delete root.dataset.dshAnsk;
  }, "ui-skin-ansk: chrome");
}

// CJS 收尾：esbuild format=cjs 原样保留该赋值，产物 exports 与官方 client.js 同形。
module.exports = { apply, inject };
