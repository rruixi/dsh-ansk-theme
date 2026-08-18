// 爱祥 — chrome 构建：标题栏 / 状态栏 / favicon。
// 契约：所有 chrome 必须是 body 的直接子节点（皮肤中心 try-on 还原配方按此摘除）；
// dispose() 全量还原（子节点移除、favicon 移除、标题还原）。

import { NOTE_SVG, STAR_SVG, PICK_SVG, PIANO_SVG, BADGE_SVG, FAVICON_SVG } from "./art.js";

/** 构建并挂载 chrome；返回 disposer。 */
export function buildChrome({ title, cells = [], titlebarGlyphs = [] }) {
  const body = document.body;
  const originalTitle = document.title;
  const originalFavicons = Array.from(document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]'));

  // ---- 标题栏 ----
  const titlebar = document.createElement("div");
  titlebar.className = "anskTitlebar";
  titlebar.dataset.skinChrome = "titlebar";
  titlebar.setAttribute("aria-hidden", "true");

  const icon = document.createElement("span");
  icon.className = "anskTitlebarIcon";
  icon.innerHTML = `${NOTE_SVG}${STAR_SVG}`;

  const pick = document.createElement("span");
  pick.className = "anskTitlebarIcon";
  pick.innerHTML = PICK_SVG;

  const badge = document.createElement("span");
  badge.className = "anskTitlebarIcon";
  badge.innerHTML = BADGE_SVG;

  const titleEl = document.createElement("span");
  titleEl.className = "anskTitlebarTitle";
  titleEl.textContent = title;

  const btn = (glyph) => {
    const el = document.createElement("span");
    el.className = "anskTitlebarBtn";
    el.setAttribute("aria-hidden", "true");
    el.textContent = glyph;
    return el;
  };
  titlebar.append(icon, pick, badge, titleEl);
  for (const glyph of titlebarGlyphs) titlebar.append(btn(glyph));

  // ---- 状态栏 ----
  const statusbar = document.createElement("div");
  statusbar.className = "anskStatusbar";
  statusbar.dataset.skinChrome = "statusbar";
  statusbar.setAttribute("aria-hidden", "true");

  const wave = document.createElement("span");
  wave.className = "anskStatusbarWave";
  wave.innerHTML = `${PIANO_SVG}${NOTE_SVG}`;

  const spacer = document.createElement("span");
  spacer.className = "anskStatusbarSpacer";
  statusbar.append(wave, spacer);
  for (const cell of cells) {
    const el = document.createElement("span");
    el.className = "anskStatusbarCell";
    el.dataset.skinCell = "";
    el.textContent = cell;
    statusbar.append(el);
  }

  // ---- favicon ----
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href = `data:image/svg+xml;utf8,${encodeURIComponent(FAVICON_SVG)}`;

  document.head.append(favicon);
  document.title = title;
  body.append(titlebar, statusbar);

  return function dispose() {
    titlebar.remove();
    statusbar.remove();
    favicon.remove();
    // 仅当标题仍是皮肤固定标题时还原（避免覆盖用户/其他插件的新标题）
    if (document.title === title) document.title = originalTitle;
    // 还原原 favicon 列表（若无则无需处理——link 已移除）
    if (originalFavicons.length === 0) {
      // 无原 favicon，浏览器会自动回退；无需动作
    }
  };
}
