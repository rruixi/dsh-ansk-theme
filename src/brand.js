// 爱祥 — BrandWordmark（deepseek + HARNESS 徽章板）品牌标加工。
// 设计：deepseek 字母 / 鲸鱼 / HARNESS 板 → 白色（CSS `color:#fff` 驱动 currentColor）；
//       HARNESS 板上的文字 → 粉蓝渐变（注入文档级 SVG paint server，把 fill 改指渐变）。
// 还原：disposer 断开观察器、还原 fill、删除注入的渐变 defs。
// React 重渲染可能把改过的 fill 属性重置回原值——观察器对 childList+subtree 持续扫描，元素重建即重新加工。

const GRADIENT_ID = "anskBrandGrad";
/** BrandWordmark svg 特征：viewBox="0 0 182 24"（182x24 原生比例，全局唯一）。 */
const WORMMARK_SELECTOR = 'svg[viewBox="0 0 182 24"]';
/** HARNESS 板上文字的原始 fill（反色 label）。 */
const BADGE_TEXT_FILL = "var(--dsw-alias-label-primary-inverted)";

let gradientSvg = null;
const branded = new Set();

/** 幂等创建文档级渐变（一个 paint server，全局 url(#anskBrandGrad) 共用）。 */
function ensureGradient() {
  if (gradientSvg !== null && gradientSvg.isConnected) return;
  gradientSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  gradientSvg.setAttribute("width", "0");
  gradientSvg.setAttribute("height", "0");
  gradientSvg.style.position = "absolute";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  grad.setAttribute("id", GRADIENT_ID);
  grad.setAttribute("x1", "0");
  grad.setAttribute("y1", "0");
  grad.setAttribute("x2", "1");
  grad.setAttribute("y2", "1");
  const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s1.setAttribute("offset", "0");
  s1.setAttribute("stop-color", "#ff9ec7");
  const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  s2.setAttribute("offset", "1");
  s2.setAttribute("stop-color", "#6fa8ff");
  grad.append(s1, s2);
  defs.append(grad);
  gradientSvg.append(defs);
  document.body.append(gradientSvg);
}

/** 加工一个 BrandWordmark svg（幂等）。 */
function brandify(svg) {
  if (svg.dataset.anskBranded !== undefined) return;
  svg.dataset.anskBranded = "";
  branded.add(svg);
  ensureGradient();
  for (const p of svg.querySelectorAll(`path[fill="${BADGE_TEXT_FILL}"]`)) {
    p.setAttribute("fill", `url(#${GRADIENT_ID})`);
  }
}

/**
 * 启动品牌标加工；返回 disposer（断开观察器 + 全量还原）。
 * @returns {() => void}
 */
export function startBranding() {
  const observer = new MutationObserver(() => {
    for (const svg of document.querySelectorAll(WORMMARK_SELECTOR)) brandify(svg);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  for (const svg of document.querySelectorAll(WORMMARK_SELECTOR)) brandify(svg);

  return () => {
    observer.disconnect();
    for (const svg of branded) {
      delete svg.dataset.anskBranded;
      for (const p of svg.querySelectorAll(`path[fill^="url(#${GRADIENT_ID})"]`)) {
        p.setAttribute("fill", BADGE_TEXT_FILL);
      }
    }
    branded.clear();
    if (gradientSvg !== null) {
      gradientSvg.remove();
      gradientSvg = null;
    }
  };
}
