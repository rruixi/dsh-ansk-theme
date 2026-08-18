// 爱祥 — 设置面板「爱祥背景」区块：位置滑块 / 大小滑块 / 上传背景图 / 恢复默认。
// 注册到 DSH 官方设置面板的 settings.section 槽。
// slots 服务经 ctx.get('slots') 可选读取（不依赖 manifest inject——宿主对包元数据有
// 跨重启缓存，inject 声明可能滞后；ctx.get 方案对 try-on miniCtx 也天然安全）。

import React, { useState } from "react";

const ROW = { margin: "10px 0" };
const LABEL = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: 13 };
const HINT = { display: "block", color: "#8891a7", fontSize: 12, marginTop: 4 };
const RANGE = { width: "100%", accentColor: "#ff9ec7" };
const BTN = {
  background: "linear-gradient(135deg,#ff9ec7 0%,#8fb3ff 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px",
  cursor: "pointer", fontWeight: 600, marginRight: 8
};
const BTN2 = {
  background: "transparent", color: "#8891a7", border: "1px solid #c3cbe0",
  borderRadius: 8, padding: "6px 14px", cursor: "pointer"
};

/**
 * 设置区块组件。
 * @param {{ layer: ReturnType<typeof import('./bg-layer.js').createBgLayer> }} props
 */
function BgSettings({ layer }) {
  const init = layer.getState();
  const [pos, setPos] = useState(init.pos);
  const [size, setSize] = useState(init.size);
  const [pick, setPick] = useState(init.pick);
  const [ops, setOps] = useState(Object.assign({}, init.ops));
  const [uploads, setUploads] = useState(init.uploads || []);
  const [error, setError] = useState(null);
  const [okMsg, setOkMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const images = init.images || [];
  const opEntries = Object.keys(init.ops || {}).map((key) => [key, key]);

  const NOTICE = { padding: "8px 10px", borderRadius: 8, fontSize: 12, margin: "6px 0", fontWeight: 600 };
  // 缩略图网格
  const THUMB = { width: 84, height: 56, objectFit: "cover", borderRadius: 6, display: "block", border: "2px solid transparent", background: "#eef0f7" };
  const THUMB_ACTIVE = { border: "2px solid #ff9ec7", boxShadow: "0 0 0 2px rgba(255,158,199,0.25)" };
  const TILE = { display: "inline-block", margin: "0 8px 8px 0", textAlign: "center", cursor: "pointer", position: "relative", verticalAlign: "top" };
  const TILE_NAME = { display: "block", fontSize: 11, color: "#4a5a86", maxWidth: 84, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3, cursor: "pointer" };
  const DEL_BTN = { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#d33", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, lineHeight: "16px", padding: 0 };
  const MINI = { width: 20, height: 18, fontSize: 10, lineHeight: "14px", padding: 0, borderRadius: 4, border: "1px solid #c3cbe0", background: "transparent", color: "#5a6a94", cursor: "pointer", margin: "2px 2px 0 0" };
  const MINI_DISABLED = { opacity: 0.35, cursor: "default" };
  const refreshFromLayer = () => {
    const s = layer.getState();
    setPos(s.pos); setSize(s.size); setPick(s.pick); setOps(Object.assign({}, s.ops));
    setUploads(s.uploads || []);
  };
  const commitRename = (id) => {
    setEditingId(null);
    layer.renameUpload(id, editName);
    refreshFromLayer();
  };
  const startEdit = (item) => { setEditingId(item.id); setEditName(item.name); };
  const move = (dir, id) => {
    const next = layer.moveUpload(id, dir);
    if (next) setUploads(next);
  };
  const tile = (item, isUpload, index, total) => React.createElement("span", {
    key: item.id,
    style: TILE,
    title: item.name,
    onClick: () => { setPick(item.id); layer.setPick(item.id); }
  },
    React.createElement("img", {
      src: item.dataUrl,
      alt: item.name,
      style: Object.assign({}, THUMB, pick === item.id ? THUMB_ACTIVE : {})
    }),
    isUpload ? React.createElement("button", {
      style: DEL_BTN, title: "删除",
      onClick: (e) => { e.stopPropagation(); layer.removeUpload(item.id).then(refreshFromLayer); }
    }, "×") : null,
    // 名称：点击 ✎ 内联编辑（仅上传图）
    isUpload && editingId === item.id
      ? React.createElement("input", {
        value: editName, autoFocus: true,
        style: { width: 78, fontSize: 11, padding: "1px 3px", marginTop: 3, boxSizing: "border-box" },
        onChange: (e) => setEditName(e.target.value),
        onClick: (e) => e.stopPropagation(),
        onBlur: () => commitRename(item.id),
        onKeyDown: (e) => {
          if (e.key === "Enter") commitRename(item.id);
          if (e.key === "Escape") setEditingId(null);
        }
      })
      : React.createElement("span", {
        style: TILE_NAME,
        onClick: (e) => { if (isUpload) { e.stopPropagation(); startEdit(item); } }
      }, (isUpload ? "✎ " : "") + item.name),
    // 排序按钮（仅上传图）
    isUpload ? React.createElement("span", { style: { display: "block" } },
      React.createElement("button", {
        style: Object.assign({}, MINI, index === 0 ? MINI_DISABLED : {}),
        disabled: index === 0, title: "前移",
        onClick: (e) => { e.stopPropagation(); move("up", item.id); }
      }, "◀"),
      React.createElement("button", {
        style: Object.assign({}, MINI, index === total - 1 ? MINI_DISABLED : {}),
        disabled: index === total - 1, title: "后移",
        onClick: (e) => { e.stopPropagation(); move("down", item.id); }
      }, "▶")
    ) : null
  );

  return React.createElement("div", null,
    // 操作反馈
    error ? React.createElement("div", { style: Object.assign({}, NOTICE, { background: "#fdecec", color: "#d33" }) }, "⚠ " + error) : null,
    okMsg ? React.createElement("div", { style: Object.assign({}, NOTICE, { background: "#eaf7ee", color: "#2e7d46" }) }, "✓ " + okMsg) : null,
    React.createElement("div", { style: ROW },
      React.createElement("label", { style: LABEL }, "背景图位置"),
      React.createElement("input", {
        type: "range", min: 0, max: 100, step: 1,
        value: pos, style: RANGE,
        onChange: (e) => { const v = Number(e.target.value); setPos(v); layer.setPos(v); }
      }),
      React.createElement("span", { style: HINT }, "当前 " + pos + "%（50% = 居中，越小越靠上）")
    ),
    React.createElement("div", { style: ROW },
      React.createElement("label", { style: LABEL }, "背景图大小"),
      React.createElement("input", {
        type: "range", min: 100, max: 300, step: 5,
        value: size, style: RANGE,
        onChange: (e) => { const v = Number(e.target.value); setSize(v); layer.setSize(v); }
      }),
      React.createElement("span", { style: HINT }, "当前 " + size + "%（100% = 铺满宽度，越大越放大）")
    ),
    // 背景图库：上传图（可预览/选择/删除）+ 内置图（assets 内嵌）
    React.createElement("div", { style: Object.assign({}, ROW, { borderTop: "1px solid #e3e8f4", paddingTop: 12, marginTop: 14 }) },
      React.createElement("label", { style: LABEL }, "背景图库"),
      React.createElement("span", { style: HINT }, "点击缩略图应用；上传的图存于本机浏览器，可随时删除"),
      React.createElement("div", null,
        React.createElement("label", { style: Object.assign({}, BTN, { display: "inline-block", marginBottom: 8 }) },
          "上传新图",
          React.createElement("input", {
            type: "file", accept: "image/*", style: { display: "none" },
            onChange: (e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              setError(null);
              setOkMsg(null);
              layer.upload(f).then(() => {
                setOkMsg("已添加并应用该背景图");
                refreshFromLayer();
              }).catch((err) => {
                setError(err && err.message ? err.message : "上传失败，请重试（JPG/PNG/WebP 格式）");
              });
              e.target.value = "";
            }
          })
        ),
        React.createElement("button", { style: Object.assign({}, BTN2, { marginBottom: 8 }), onClick: () => { layer.reset().then(refreshFromLayer); } }, "恢复默认")
      ),
      // 上传图（带删除/排序/重命名）
      uploads.length > 0 ? React.createElement("div", { style: { marginTop: 4 } },
        uploads.map((u, idx) => tile(u, true, idx, uploads.length))
      ) : null,
      // 内置图（assets 内嵌）
      React.createElement("div", { style: { marginTop: uploads.length > 0 ? 6 : 2 } },
        images.map((img) => tile(img, false))
      )
    ),
    // 各界面透明度（百分比滑块，实时生效 + localStorage 持久化）
    React.createElement("div", { style: Object.assign({}, ROW, { borderTop: "1px solid #e3e8f4", paddingTop: 12, marginTop: 14 }) },
      React.createElement("label", { style: LABEL }, "界面透明度"),
      React.createElement("span", { style: HINT }, "值越大越不透明；0 = 完全透明（透出背景图）"),
      opEntries.map(([key]) => {
        const label = OP_LABEL(key);
        const v = Math.round((ops[key] ?? 0) * 100);
        return React.createElement("div", { key, style: { margin: "8px 0" } },
          React.createElement("span", { style: { display: "block", fontSize: 12, color: "#4a5a86", marginBottom: 2 } },
            label + "：" + v + "%"),
          React.createElement("input", {
            type: "range", min: 0, max: 100, step: 1, value: v, style: RANGE,
            onChange: (e) => {
              const nv = Number(e.target.value) / 100;
              setOps((prev) => { const next = Object.assign({}, prev); next[key] = nv; return next; });
              layer.setOp(key, nv);
            }
          })
        );
      })
    )
  );
}

/** 透明度键 → 显示名（与 bg-store.js OP_LABELS 一致）。 */
const OP_LABEL_MAP = { card: "对话主卡片", sidebar: "侧边栏", details: "细节面板", center: "对话内容区", scrim: "背景图遮罩" };
function OP_LABEL(key) { return OP_LABEL_MAP[key] || key; }

/**
 * 注册设置区块到官方设置面板。
 * @param {any} ctx - cordis 上下文；slots 经 ctx.get('slots') 读取（未提供/无 get 则跳过）
 * @param {ReturnType<typeof import('./bg-layer.js').createBgLayer>} layer
 * @returns {() => void} disposer
 */
export function registerSettings(ctx, layer) {
  let dispose = null;
  let timer = null;

  const tryRegister = () => {
    let slots;
    try {
      slots = typeof ctx.get === "function" ? ctx.get("slots") : undefined;
    } catch {
      slots = undefined;
    }
    if (!slots || typeof slots.inject !== "function") return false;
    const disposers = [];
    slots.inject("settings.section", () => {
      const d = slots.register(
        { name: "settings.section", id: "ansk-bg", order: 500, label: () => "爱祥背景" },
        () => React.createElement(BgSettings, { layer })
      );
      if (typeof d === "function") disposers.push(d);
      return d;
    });
    dispose = () => { for (const d of disposers) { try { d(); } catch {} } };
    return true;
  };

  // 完整 cordis ctx 才有 get（try-on miniCtx 无 get，直接跳过）。
  if (typeof ctx.get === "function" && !tryRegister()) {
    // slots 由 app-shell 提供，可能晚于皮肤激活——轮询等待（最长 ~15s）。
    let tries = 0;
    timer = setInterval(() => {
      tries++;
      if (tryRegister() || tries >= 75) { clearInterval(timer); timer = null; }
    }, 200);
  }

  return () => {
    if (timer !== null) clearInterval(timer);
    if (dispose !== null) dispose();
  };
}
