// 爱祥 — 背景图层管理：独立 fixed div（.anskBg，z-index:-1），
// 图源（内置图库选择 / 上传）、位置、大小全部经 CSS 变量控制，设置面板可调、可持久化。
// 依赖：src/generated/bg.js（build 时内嵌图库，assets/ 下每张图一个条目）与 src/bg-store.js（持久化）。
// 图源优先级：上传图 > 图库中选择的图 > 图库默认（bg）。

import { BG_IMAGES } from "./generated/bg.js";
import * as store from "./bg-store.js";
const DEFAULT_POS = 45;   // 位置百分比（45 = 比中心略高，即"上调一点"）
const DEFAULT_SIZE = 100; // 大小百分比（100 = 宽度撑满，等同 cover 裁切）
/** 上传图 data URL 上限（约 9MB 源图）；过大容易触发 IndexedDB 配额/渲染问题。 */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
/** 图库默认选中：第一张（build 时 bg 优先排第一）。 */
const DEFAULT_PICK = BG_IMAGES[0]?.id ?? null;

/** 预检 data URL 能否被浏览器解码（Image onload 成功才算数），resolve 返回 Image 对象。 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("无法解析该图片（格式不支持或文件损坏）"));
    img.src = url;
  });
}

/**
 * canvas 重编码：把任意可解码图片统一转成 JPEG（缩放 + 压缩）。
 * - 尺寸超过 maxDim 的边缩放到 maxDim（默认 2560，够做背景且体积可控）
 * - 透明区域垫白（JPEG 无 alpha）
 * - 输出 quality 0.85 的 JPEG data URL——统一格式、压缩体积，IndexedDB 存储与
 *   CSS 渲染都不会再遇到兼容性问题
 */
async function reencodeImage(dataUrl, maxDim = 2560, quality = 0.85) {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h); // 透明底垫白
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * 创建背景图层控制器。
 * @returns {{
 *   getState(): { pos: number, size: number, hasUpload: boolean, pick: string | null, images: {id:string,name:string}[] },
 *   setPos(v: number): void,
 *   setSize(v: number): void,
 *   setPick(id: string): void,
 *   upload(file: File): Promise<void>,
 *   reset(): Promise<void>,
 *   dispose(): void
 * }}
 */
export function createBgLayer() {
  const el = document.createElement("div");
  el.className = "anskBg";
  document.body.append(el); // body 直接子节点（皮肤中心 try-on 还原配方兼容）

  let pos = store.readPos();
  let size = store.readSize();
  let pick = store.readPick(DEFAULT_PICK);
  let ops = store.readOps();
  /** 上传图库 [{id,name,dataUrl}]（IndexedDB 持久化，可多张）。 */
  let uploads = [];

  /** 当前生效图 data URL（按 pick 解析：'up-*' 上传图 > 内置图 id > 内置第一张）。 */
  function currentImage() {
    if (typeof pick === "string" && pick.startsWith("up-")) {
      const f = uploads.find((i) => i.id === pick);
      if (f) return f.dataUrl;
    }
    const found = BG_IMAGES.find((i) => i.id === pick);
    return found ? found.dataUrl : (BG_IMAGES[0]?.dataUrl ?? null);
  }

  /** 应用各界面透明度到 body（CSS 变量可继承到所有面板）。 */
  function applyOps() {
    for (const key of Object.keys(store.DEFAULT_OPS)) {
      document.body.style.setProperty(`--ansk-op-${key}`, String(ops[key]));
    }
  }

  /** 应用当前状态到图层。 */
  function apply() {
    const img = currentImage();
    if (img) {
      el.style.setProperty("--ansk-bg", `url("${img}")`);
      el.style.display = "";
    } else {
      el.style.removeProperty("--ansk-bg");
      el.style.display = "none"; // 无图：隐藏图层，露出 body 纯渐变
    }
    el.style.setProperty("--ansk-bg-pos", `${pos}%`);
    // 只存纯百分比：CSS 里 background-size: ... var(--ansk-bg-size, 100%) auto
    // 会自动补 auto——若这里再带 "auto" 会拼成三值非法（150% auto auto），整条被丢弃。
    el.style.setProperty("--ansk-bg-size", `${size}%`);
    applyOps();
  }

  // 异步恢复上传图库（首次加载不阻塞 apply）。
  store.readUploaded().then((list) => { uploads = list; apply(); }).catch(() => {});

  return {
    getState: () => ({
      pos,
      size,
      pick,
      ops,
      hasUpload: uploads.length > 0,
      images: BG_IMAGES.map(({ id, name, dataUrl }) => ({ id, name, dataUrl })),
      uploads: uploads.map(({ id, name, dataUrl }) => ({ id, name, dataUrl }))
    }),
    setPos(v) {
      pos = Math.min(100, Math.max(0, Math.round(v)));
      store.writePos(pos);
      apply();
    },
    setSize(v) {
      size = Math.min(300, Math.max(100, Math.round(v)));
      store.writeSize(size);
      apply();
    },
    setOp(key, v) {
      if (!(key in store.DEFAULT_OPS)) return;
      ops[key] = Math.min(1, Math.max(0, v));
      store.writeOps(ops);
      applyOps();
    },
    setPick(id) {
      const inBuiltin = BG_IMAGES.some((i) => i.id === id);
      const inUploads = uploads.some((i) => i.id === id);
      if (!inBuiltin && !inUploads) return;
      pick = id;
      store.writePick(id);
      apply();
    },
    async upload(file) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      if (dataUrl.length > MAX_UPLOAD_BYTES) {
        throw new Error(`图片过大（超过 ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB），请压缩后重试`);
      }
      // canvas 重编码：统一 JPEG + 缩放压缩。解码失败在此抛出（绝不污染背景），
      // 成功则得到干净的标准 JPEG data URL，CSS 渲染必然可用。
      const clean = await reencodeImage(dataUrl);
      const item = {
        id: "up-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: (file.name || "上传图").replace(/\.[^.]+$/, "") || "上传图",
        dataUrl: clean
      };
      uploads = [...uploads, item];
      await store.writeUploaded(uploads);
      pick = item.id;
      store.writePick(pick);
      apply();
    },
    /** 删除一张上传图；若为当前选中则回退默认。 */
    async removeUpload(id) {
      uploads = uploads.filter((i) => i.id !== id);
      await store.writeUploaded(uploads);
      if (pick === id) {
        pick = DEFAULT_PICK;
        store.writePick(pick);
      }
      apply();
    },
    /** 上传图排序：dir = "up" | "down"，交换相邻位置并持久化。 */
    moveUpload(id, dir) {
      const idx = uploads.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      const to = idx + (dir === "up" ? -1 : 1);
      if (to < 0 || to >= uploads.length) return null;
      const next = [...uploads];
      [next[idx], next[to]] = [next[to], next[idx]];
      uploads = next;
      store.writeUploaded(uploads).catch(() => {});
      return uploads.map(({ id: i, name, dataUrl }) => ({ id: i, name, dataUrl }));
    },
    /** 上传图重命名（去空格、限长）。 */
    renameUpload(id, name) {
      const it = uploads.find((i) => i.id === id);
      if (!it) return null;
      it.name = String(name).trim().slice(0, 40) || "上传图";
      store.writeUploaded(uploads).catch(() => {});
      return uploads.map(({ id: i, name: n, dataUrl }) => ({ id: i, name: n, dataUrl }));
    },
    async reset() {
      pos = DEFAULT_POS;
      size = DEFAULT_SIZE;
      pick = DEFAULT_PICK;
      ops = { ...store.DEFAULT_OPS };
      uploads = [];
      store.writePos(pos);
      store.writeSize(size);
      store.writePick(pick);
      store.writeOps(ops);
      await store.writeUploaded([]);
      apply();
    },
    dispose() {
      el.remove();
    }
  };
}

export { DEFAULT_POS, DEFAULT_SIZE };
