// 爱祥 — 设置面板「爱祥背景」页：位置/大小滑块、背景图库（上传/选择/排序/重命名/删除）、
// 各界面透明度滑块、恢复默认。
//
// 注册方式遵循 DSH Desktop 当前契约（与官方 ui-theme / ui-settings-general 一致）：
//   1) client 模块导出 inject = ['slots', 'locale']，因此 apply 时可直接用 ctx.slots / ctx.locale；
//   2) ctx.slots.inject('settings.section', () => ctx.slots.register({...}, Component))；
//   3) 界面文案走 ctx.locale.register(ns, {zh, en}) + ctx.locale.bind(ns)（语言切换自动生效）。
//
// 槽位注册对象：{ name, id, order, label, locale }；
// 槽位组件收到的 props 由宿主提供（例如 settings.section 会带上 close）。
// 纯渲染，无副作用：资源注册全部在 apply 内用 ctx.effect 完成。

import React from "react";

/** 设置页在「设置」列表中的排序（官方 General=0 / agent-presets=20，皮肤排在后面）。 */
const SECTION_ORDER = 500;

const ROW = { margin: "10px 0" };
const LABEL = { display: "block", fontWeight: 600, marginBottom: 4, fontSize: 13 };
const HINT = { display: "block", color: "var(--dsw-alias-label-secondary)", fontSize: 12, marginTop: 4 };
const RANGE = { width: "100%", accentColor: "#ff9ec7" };
const BTN = {
  background: "linear-gradient(135deg,#ff9ec7 0%,#8fb3ff 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px",
  cursor: "pointer", fontWeight: 600, marginRight: 8
};
const BTN2 = {
  background: "transparent", color: "var(--dsw-alias-label-secondary)",
  border: "1px solid var(--dsw-alias-border-l2)",
  borderRadius: 8, padding: "6px 14px", cursor: "pointer"
};
const DIVIDER = { borderTop: "1px solid var(--dsw-alias-border-l1)", paddingTop: 12, marginTop: 14 };
const NOTICE = { padding: "8px 10px", borderRadius: 8, fontSize: 12, margin: "6px 0", fontWeight: 600 };
const THUMB = {
  width: 84, height: 56, objectFit: "cover", borderRadius: 6, display: "block",
  border: "2px solid transparent", background: "var(--dsw-alias-bg-layer-2)"
};
const THUMB_ACTIVE = { border: "2px solid #ff9ec7", boxShadow: "0 0 0 2px rgba(255,158,199,0.25)" };
const TILE = { display: "inline-block", margin: "0 8px 8px 0", textAlign: "center", cursor: "pointer", position: "relative", verticalAlign: "top" };
const TILE_NAME = {
  display: "block", fontSize: 11, color: "var(--dsw-alias-label-secondary)", maxWidth: 84,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 3, cursor: "pointer"
};
const DEL_BTN = {
  position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
  background: "#d33", color: "#fff", border: "none", cursor: "pointer", fontSize: 12,
  lineHeight: "16px", padding: 0
};
const MINI = {
  width: 20, height: 18, fontSize: 10, lineHeight: "14px", padding: 0, borderRadius: 4,
  border: "1px solid var(--dsw-alias-border-l2)", background: "transparent",
  color: "var(--dsw-alias-label-secondary)", cursor: "pointer", margin: "2px 2px 0 0"
};
const MINI_DISABLED = { opacity: 0.35, cursor: "default" };

/**
 * 设置页组件。
 * @param {{ layer: ReturnType<typeof import('./bg-layer.js').createBgLayer>, t: (key: string, params?: Record<string, unknown>) => string }} props
 */
function BgSettings({ layer, t }) {
  const init = layer.getState();
  const [pos, setPos] = React.useState(init.pos);
  const [size, setSize] = React.useState(init.size);
  const [pick, setPick] = React.useState(init.pick);
  const [ops, setOps] = React.useState(Object.assign({}, init.ops));
  const [uploads, setUploads] = React.useState(init.uploads || []);
  const [error, setError] = React.useState(null);
  const [okMsg, setOkMsg] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [editName, setEditName] = React.useState("");
  const images = init.images || [];
  /** 透明度键（顺序稳定，取自 store 的默认键集合）。 */
  const opKeys = Object.keys(init.ops || {});

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
      style: DEL_BTN, title: "×",
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
        disabled: index === 0, title: "◀",
        onClick: (e) => { e.stopPropagation(); move("up", item.id); }
      }, "◀"),
      React.createElement("button", {
        style: Object.assign({}, MINI, index === total - 1 ? MINI_DISABLED : {}),
        disabled: index === total - 1, title: "▶",
        onClick: (e) => { e.stopPropagation(); move("down", item.id); }
      }, "▶")
    ) : null
  );

  return React.createElement("div", null,
    // 操作反馈
    error ? React.createElement("div", {
      style: Object.assign({}, NOTICE, { background: "var(--dsw-alias-state-error-primary)", color: "#fff" })
    }, "⚠ " + error) : null,
    okMsg ? React.createElement("div", {
      style: Object.assign({}, NOTICE, { background: "var(--dsw-alias-state-success-primary)", color: "#fff" })
    }, "✓ " + okMsg) : null,
    React.createElement("div", { style: ROW },
      React.createElement("label", { style: LABEL }, t("bg.pos")),
      React.createElement("input", {
        type: "range", min: 0, max: 100, step: 1,
        value: pos, style: RANGE,
        onChange: (e) => { const v = Number(e.target.value); setPos(v); layer.setPos(v); }
      }),
      React.createElement("span", { style: HINT }, t("bg.pos.hint", { v: pos }))
    ),
    React.createElement("div", { style: ROW },
      React.createElement("label", { style: LABEL }, t("bg.size")),
      React.createElement("input", {
        type: "range", min: 100, max: 300, step: 5,
        value: size, style: RANGE,
        onChange: (e) => { const v = Number(e.target.value); setSize(v); layer.setSize(v); }
      }),
      React.createElement("span", { style: HINT }, t("bg.size.hint", { v: size }))
    ),
    // 背景图库：上传图（可预览/选择/删除）+ 内置图（构建期内嵌）
    React.createElement("div", { style: Object.assign({}, ROW, DIVIDER) },
      React.createElement("label", { style: LABEL }, t("gallery")),
      React.createElement("span", { style: HINT }, t("gallery.hint")),
      React.createElement("div", null,
        React.createElement("label", { style: Object.assign({}, BTN, { display: "inline-block", marginBottom: 8 }) },
          t("upload"),
          React.createElement("input", {
            type: "file", accept: "image/*", style: { display: "none" },
            onChange: (e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              setError(null);
              setOkMsg(null);
              layer.upload(f).then(() => {
                setOkMsg(t("ok.uploaded"));
                refreshFromLayer();
              }).catch((err) => {
                setError(err && err.message ? err.message : t("err.upload"));
              });
              e.target.value = "";
            }
          })
        ),
        React.createElement("button", {
          style: Object.assign({}, BTN2, { marginBottom: 8 }),
          onClick: () => { layer.reset().then(refreshFromLayer); }
        }, t("reset"))
      ),
      // 上传图（带删除/排序/重命名）
      uploads.length > 0 ? React.createElement("div", { style: { marginTop: 4 } },
        uploads.map((u, idx) => tile(u, true, idx, uploads.length))
      ) : null,
      // 内置图（构建期内嵌）
      React.createElement("div", { style: { marginTop: uploads.length > 0 ? 6 : 2 } },
        images.map((img) => tile(img, false))
      )
    ),
    // 各界面透明度（百分比滑块，实时生效 + localStorage 持久化）
    React.createElement("div", { style: Object.assign({}, ROW, DIVIDER) },
      React.createElement("label", { style: LABEL }, t("opacity")),
      React.createElement("span", { style: HINT }, t("opacity.hint")),
      opKeys.map((key) => {
        const v = Math.round((ops[key] ?? 0) * 100);
        return React.createElement("div", { key, style: { margin: "8px 0" } },
          React.createElement("span", {
            style: { display: "block", fontSize: 12, color: "var(--dsw-alias-label-secondary)", marginBottom: 2 }
          }, t(OP_LABEL_KEY(key)) + "：" + v + "%"),
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

/** 透明度键 → i18n 文案键（与 bg-store.js OP_LABELS 一致）。 */
const OP_LABEL_MAP = { card: "op.card", sidebar: "op.sidebar", details: "op.rightbar", center: "op.center", scrim: "op.scrim" };
function OP_LABEL_KEY(key) { return OP_LABEL_MAP[key] || key; }

/**
 * 注册设置页到官方设置面板的 settings.section 槽。
 * @param {any} ctx 客户端 cordis 上下文（inject 保证含 slots / locale）
 * @param {ReturnType<typeof import('./bg-layer.js').createBgLayer>} layer
 * @param {(key: string, params?: Record<string, unknown>) => string} t 已绑定的界面文案函数
 * @returns {() => void} disposer
 */
export function registerSettings(ctx, layer, t) {
  const slots = ctx.slots;
  if (!slots || typeof slots.inject !== "function" || typeof slots.register !== "function") {
    // 理论上不会发生（inject 声明了 slots）；失败时不影响皮肤其余部分。
    ctx.effect(() => () => {}, "ui-skin-ansk: settings unavailable");
    return () => {};
  }
  const disposers = [];
  const disposeInjection = slots.inject("settings.section", () => {
    const d = slots.register(
      {
        name: "settings.section",
        id: "ansk-bg",
        order: SECTION_ORDER,
        label: () => t("nav"),
        locale: "ansk"
      },
      () => React.createElement(BgSettings, { layer, t })
    );
    if (typeof d === "function") disposers.push(d);
    return d;
  });
  if (typeof disposeInjection === "function") disposers.push(disposeInjection);

  return () => {
    for (const d of disposers) { try { d(); } catch {} }
    disposers.length = 0;
  };
}
