// 爱祥 (Anon × Sakiko) — 内联 SVG 美术资源。
// 全部为代码内联字符串：零图片依赖，随 bundle 打包，无外部请求。

/** 双八分音符（音乐/祥子 主题），白色填充，用于标题栏与 favicon。
 *  路径为通用音符造型（参考 dsh-skins miku 皮肤的同款音符合理重构，BSD-3-Clause）。 */
export const NOTE_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">',
  '<path d="M32 8v20.6a8 8 0 1 1-4-6.9V13.4L20 16.8v17.8a8 8 0 1 1-4-6.9V12.2c0-.9.6-1.7 1.5-1.9l16-4.4c1-.3 2 .3 2.5 1.1.3.5.5 1 .5 1.5z" fill="#fff"/>',
  '<ellipse cx="24" cy="44" rx="7.5" ry="2.4" fill="rgba(255,255,255,0.45)"/>',
  '</svg>'
].join("");

/** 四芒星（MyGO!!!!! 星星 / 爱音 主题），白色填充。 */
export const STAR_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">',
  '<path d="M24 3c1.5 12 5.2 15.8 21 21-15.8 5.2-19.5 9-21 21-1.5-12-5.2-15.8-21-21 15.8-5.2 19.5-9 21-21z" fill="#fff" opacity="0.95"/>',
  '</svg>'
].join("");

/** 吉他拨片 + 星（爱音 吉他主题），标题栏装饰。 */
export const PICK_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">',
  '<path d="M24 2C36 8 42 18 42 28c0 10-6 18-18 18S6 38 6 28C6 18 12 8 24 2z" fill="rgba(255,255,255,0.92)"/>',
  '<path d="M24 15.5l3.2 7 7.3.8-5.4 5 1.4 7.2L24 32.6l-6.5 3.9 1.4-7.2-5.4-5 7.3-.8z" fill="#ff9ec7"/>',
  '</svg>'
].join("");

/** 钢琴键条（祥子 钢琴主题），状态栏装饰。 */
export const PIANO_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="38" height="16" viewBox="0 0 48 20" aria-hidden="true">',
  '<rect x="0.5" y="0.5" width="47" height="19" rx="2.5" fill="#fff" opacity="0.95" stroke="rgba(111,168,255,0.5)"/>',
  '<rect x="6.2" y="0.5" width="3" height="10.5" rx="1" fill="#3a3f55"/>',
  '<rect x="15.2" y="0.5" width="3" height="10.5" rx="1" fill="#3a3f55"/>',
  '<rect x="24.2" y="0.5" width="3" height="10.5" rx="1" fill="#3a3f55"/>',
  '<rect x="33.2" y="0.5" width="3" height="10.5" rx="1" fill="#3a3f55"/>',
  '<rect x="42.2" y="0.5" width="3" height="10.5" rx="1" fill="#3a3f55"/>',
  '</svg>'
].join("");

/** "ANK 01" 徽标：粉蓝渐变圆角芯片，白色描边与数字。 */
export const BADGE_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 72 36" aria-hidden="true">',
  '<defs><linearGradient id="anskBadge" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="rgba(255,158,199,0.35)"/>',
  '<stop offset="1" stop-color="rgba(111,168,255,0.35)"/>',
  '</linearGradient></defs>',
  '<rect x="1" y="1" width="70" height="34" rx="9" fill="url(#anskBadge)" stroke="#fff" stroke-width="2"/>',
  '<text x="36" y="25" text-anchor="middle" font-family="Consolas, monospace" font-size="17" font-weight="700" fill="#fff" letter-spacing="0.5">ANSK 01</text>',
  '</svg>'
].join("");

/** favicon：粉→蓝渐变圆角方块 + 双音符 + 四芒星。 */
export const FAVICON_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">',
  '<defs><linearGradient id="anskFav" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="#ff9ec7"/>',
  '<stop offset="1" stop-color="#6fa8ff"/>',
  '</linearGradient></defs>',
  '<rect x="2" y="2" width="60" height="60" rx="14" fill="url(#anskFav)"/>',
  '<path d="M23 15v22.6a8.8 8.8 0 1 1-4.4-7.6V22.4l18-5v21.2a8.8 8.8 0 1 1-4.4-7.6V13.8c0-1 .7-1.9 1.7-2.1l15.5-4.3c1-.3 2 .4 2.5 1.4.3.5.4 1.1.3 1.7L26.5 13.9c-.9.3-1.6.9-2 1.6l-1.5-.5z" fill="#fff"/>',
  '<path d="M48 3.5c1 7.6 3.4 10.2 11.5 13.5C51.4 20.3 49 22.9 48 30.5c-1-7.6-3.4-10.2-11.5-13.5C44.6 13.7 47 11.1 48 3.5z" fill="#fff" opacity="0.92"/>',
  '</svg>'
].join("");
