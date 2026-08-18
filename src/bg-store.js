// 爱祥 — 背景设置持久化：localStorage（位置/大小）+ IndexedDB（上传图 data URL）。

const POS_KEY = "ansk.bg.pos";
const SIZE_KEY = "ansk.bg.size";
const PICK_KEY = "ansk.bg.pick";
const OPS_KEY = "ansk.bg.ops";
const IDB_NAME = "ansk-skin";
const IDB_STORE = "bg";
const IDB_UPLOADED_KEY = "uploaded";
const IDB_LEGACY_UPLOAD_KEY = "upload";

/** 各界面透明度默认值（与 skin.css.js 的 var() fallback 一致）。 */
export const DEFAULT_OPS = { card: 0.42, sidebar: 0.55, details: 0.55, center: 0.4, scrim: 0.35 };
/** 透明度键的显示名与顺序。 */
export const OP_LABELS = [
  ["card", "对话主卡片"],
  ["sidebar", "侧边栏"],
  ["details", "细节面板"],
  ["center", "对话内容区"],
  ["scrim", "背景图遮罩"]
];

/** 读取数字设置（带默认值，非法/越界回退默认）。 */
export function readPos() {
  const raw = localStorage.getItem(POS_KEY);
  if (raw === null) return 45;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 45;
}
export function readSize() {
  const raw = localStorage.getItem(SIZE_KEY);
  if (raw === null) return 100;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 100 && n <= 300 ? n : 100;
}
export function writePos(v) { localStorage.setItem(POS_KEY, String(v)); }
export function writeSize(v) { localStorage.setItem(SIZE_KEY, String(v)); }

/** 图库选中项（id）；缺省回退默认 id。 */
export function readPick(fallback) {
  const raw = localStorage.getItem(PICK_KEY);
  return typeof raw === "string" && raw.length > 0 ? raw : fallback;
}
export function writePick(id) { localStorage.setItem(PICK_KEY, id); }

/** 读取各界面透明度（0–1）；缺失/非法回退默认。 */
export function readOps() {
  const out = { ...DEFAULT_OPS };
  try {
    const raw = localStorage.getItem(OPS_KEY);
    if (!raw) return out;
    const o = JSON.parse(raw);
    for (const k of Object.keys(DEFAULT_OPS)) {
      const v = Number(o[k]);
      if (Number.isFinite(v) && v >= 0 && v <= 1) out[k] = v;
    }
  } catch {}
  return out;
}
export function writeOps(ops) { localStorage.setItem(OPS_KEY, JSON.stringify(ops)); }

/** IndexedDB 封装（极小实现）。 */
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbTx(mode, fn) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, mode);
    const store = tx.objectStore(IDB_STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** 读取上传图库 [{id,name,dataUrl}]；无则 []。兼容迁移旧单图键。 */
export async function readUploaded() {
  try {
    const v = await idbTx("readonly", (s) => s.get(IDB_UPLOADED_KEY));
    if (Array.isArray(v) && v.every((i) => i && typeof i.id === "string" && typeof i.dataUrl === "string")) {
      return v;
    }
    // 迁移旧版单图（键 upload）
    const legacy = await idbTx("readonly", (s) => s.get(IDB_LEGACY_UPLOAD_KEY));
    if (typeof legacy === "string" && legacy.startsWith("data:image/")) {
      const item = { id: "up-" + Date.now().toString(36), name: "上传图", dataUrl: legacy };
      await idbTx("readwrite", (s) => { s.delete(IDB_LEGACY_UPLOAD_KEY); s.put([item], IDB_UPLOADED_KEY); });
      return [item];
    }
    return [];
  } catch {
    return [];
  }
}
/** 保存上传图库（覆盖写）。 */
export async function writeUploaded(list) {
  await idbTx("readwrite", (s) =>
    s.put(list.filter((i) => i && typeof i.id === "string" && typeof i.dataUrl === "string"), IDB_UPLOADED_KEY)
  );
}
