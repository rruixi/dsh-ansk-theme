// 爱祥 (Anon × Sakiko) — 样式（CSS-in-JS 字符串，作用域 body[data-dsh-ansk] / html[data-dsh-ansk]）。
// 亮/暗双套：暗色选择器 [data-ds-dark-theme]（官方 theme 服务设置的属性）。
//
// 锚点选择器说明（CSS Modules 类名是「哈希_局部名」，哈希跨构建会变、后缀稳定）：
//   [class$='_frame']        AppFrame 三列网格（现版 GUI）
//   [class$='_sidebarCol']   侧边栏列
//   [class$='_rightbarCol']  右栏（现版 GUI 叫 rightbar，旧版叫 detailsCol）
//   [class$='_centerCol']    对话中列
//   #root                应用挂载点（#root，现版基线只有 height:100%;margin:0）
// 注意：绝不给含 fixed 后代的容器加 backdrop-filter（会把 fixed 包含块改绑到该容器）。

export const SKIN_CSS = [
  // ---------- 文档根 + 全局底色：粉蓝撞色渐变（亮）。背景插画在独立图层 .anskBg
  // （z-index:-1），经 CSS 变量控制位置/大小/图源，设置面板可调。 ----------
  // 皮肤 chrome 尺寸集中在这里（挂在 html 上），避免各处散落魔数：
  //   --ansk-titlebar-h  标题栏高度（macOS 用 36px，让文字与红黄绿灯同一水平线）
  //   --ansk-statusbar-h 状态栏高度
  //   --ansk-chrome-h    两者之和（#root 算高度用）
  //   --ansk-tl-pad      标题栏左侧留白（macOS 必须让开红黄绿灯，约 78px）
  // 这些变量必须挂在 html 上并排在平台覆盖之前：body[data-dsh-ansk]{…} 与
  // html[data-platform='darwin'][data-dsh-ansk]{…} 同为 (0,2,0)，先出现者会被后者按
  // 源码顺序覆盖；若把默认值留在 body 块里（它排在文件后面），darwin 覆盖会被反向吃掉。
  "html[data-dsh-ansk]{",
  "--ansk-titlebar-h:30px;",
  "--ansk-statusbar-h:24px;",
  "--ansk-chrome-h:54px;",
  "--ansk-tl-pad:6px;",
  "background:transparent;",
  "}",
  // 给固定标题栏/状态栏让位（标题栏在上、状态栏在下）。
  "html[data-dsh-ansk] body{",
  "padding:var(--ansk-chrome-top,30px) 0 var(--ansk-statusbar-h) !important;",
  "}",
  // ---------- macOS（Electron 原生窗口）适配 ----------
  // 红黄绿灯是系统绘制的窗口按钮，固定在窗口左上角：标题栏内容必须整体右移让开，
  // 装饰用的「— □ ×」也要撤掉（真按钮就在旁边，再画三个假的是双重窗口按钮）。
  "html[data-platform='darwin'][data-dsh-ansk]{",
  "--ansk-chrome-top:36px;",
  "--ansk-titlebar-h:36px;",
  "--ansk-chrome-h:60px;",
  "--ansk-tl-pad:78px;",
  "}",
  "html[data-platform='darwin'][data-dsh-ansk] .anskTitlebarBtn{",
  "display:none;",
  "}",
  // 全屏（无红黄绿灯）时标题栏回到 30px、装饰按钮放回来、左侧留白收窄。
  "html[data-platform='darwin'][data-fullscreen][data-dsh-ansk]{",
  "--ansk-chrome-top:30px;",
  "--ansk-titlebar-h:30px;",
  "--ansk-chrome-h:54px;",
  "--ansk-tl-pad:6px;",
  "}",
  "html[data-platform='darwin'][data-fullscreen][data-dsh-ansk] .anskTitlebarBtn{",
  "display:inline-flex;",
  "}",
  "body[data-dsh-ansk]{",
  "--ansk-pink:#ff9ec7;",
  "--ansk-pink-soft:#ffd3e4;",
  "--ansk-blue:#6fa8ff;",
  "--ansk-blue-deep:#3f7df2;",
  "--ansk-ink:#33405c;",
  "--dsw-font-family:'Segoe UI','Microsoft YaHei','PingFang SC',sans-serif;",
  "color:var(--ansk-ink);",
  "box-sizing:border-box;",
  "background-color:#f4f6ff;",
  "background-image:",
  "radial-gradient(120% 90% at 85% -10%,rgba(255,158,199,0.55) 0%,rgba(255,158,199,0) 55%),",
  "radial-gradient(120% 90% at 10% 110%,rgba(111,168,255,0.5) 0%,rgba(111,168,255,0) 55%),",
  "linear-gradient(160deg,#ffeef5 0%,#f6f1ff 45%,#eaf2ff 100%);",
  "background-attachment:fixed;",
  "padding:var(--ansk-chrome-top,30px) 10px var(--ansk-statusbar-h);",
  "}",
  // ---------- 全局底色（暗） ----------
  "body[data-dsh-ansk][data-ds-dark-theme]{",
  "color:#dbe4f5;",
  "background-color:#141a2b;",
  "background-image:",
  "radial-gradient(120% 90% at 85% -10%,rgba(255,158,199,0.28) 0%,rgba(255,158,199,0) 55%),",
  "radial-gradient(120% 90% at 10% 110%,rgba(111,168,255,0.3) 0%,rgba(111,168,255,0) 55%),",
  "linear-gradient(160deg,#1a2036 0%,#161c30 45%,#121828 100%);",
  "}",
  // ---------- 背景插画独立图层：fixed 全视口、z-index -1、可调位置/大小。
  // 层次从上到下：半透明遮罩（保可读）→ 氛围光 → 插画（最底）。
  // 位置/大小/图源由 --ansk-bg / --ansk-bg-pos / --ansk-bg-size 变量控制（设置面板可调）。
  // ----------
  "body[data-dsh-ansk] .anskBg{",
  "position:fixed;inset:0;z-index:-1;pointer-events:none;",
  "background-repeat:no-repeat;",
  "background-image:",
  "linear-gradient(rgba(255,246,250,var(--ansk-op-scrim,0.35)) 0%,rgba(255,246,250,var(--ansk-op-scrim,0.35)) 100%),",
  "radial-gradient(120% 90% at 85% -10%,rgba(255,158,199,0.35) 0%,rgba(255,158,199,0) 55%),",
  "radial-gradient(120% 90% at 10% 110%,rgba(111,168,255,0.32) 0%,rgba(111,168,255,0) 55%),",
  "var(--ansk-bg, none);",
  "background-position:center,center,center,center var(--ansk-bg-pos, 45%);",
  "background-size:100% 100%,120% 100%,120% 100%,var(--ansk-bg-size, 100%) auto;",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskBg{",
  "background-image:",
  "linear-gradient(rgba(26,32,54,var(--ansk-op-scrim,0.45)) 0%,rgba(26,32,54,var(--ansk-op-scrim,0.45)) 100%),",
  "radial-gradient(120% 90% at 85% -10%,rgba(255,158,199,0.18) 0%,rgba(255,158,199,0) 55%),",
  "radial-gradient(120% 90% at 10% 110%,rgba(111,168,255,0.18) 0%,rgba(111,168,255,0) 55%),",
  "var(--ansk-bg, none);",
  "}",
  // ---------- 对话主区：半透明卡片（不使用 backdrop-filter：它会把 fixed 后代
  // （设置面板/弹层）的包含块从视口拽到卡片上，导致全视口面板错位） ----------
  // 现版基线：#root{height:100%;margin:0}，AppFrame 铺满视口；皮肤把它收成一条卡片，
  // 上下留出固定标题栏/状态栏的高度。
  // 坑：必须写 `#root`（真 ID 选择器），不能写 `[id=root]`——后者是【属性选择器】，
  // 特异性只有 (0,2,1)，会被框架基线的 `#root`(1,0,0) 按特异性压掉，height 根本不生效
  // （症状：卡片只有内容高度、底部与状态栏错位）。
  "body[data-dsh-ansk] #root{",
  "box-sizing:border-box;",
  "height:calc(100vh - var(--ansk-chrome-h));",
  "margin:0 10px; /* 竖直方向不加外边距：卡片底边必须正好落在状态栏顶边 */",
  "background:rgba(255,255,255,var(--ansk-op-card,0.42));",
  "border:1px solid rgba(111,168,255,0.45);",
  "border-radius:14px;",
  "box-shadow:0 10px 34px rgba(63,125,242,0.18);",
  "overflow:hidden;",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] #root{",
  "background:rgba(20,26,43,var(--ansk-op-card,0.48));",
  "border-color:rgba(111,168,255,0.35);",
  "box-shadow:0 10px 34px rgba(0,0,0,0.45);",
  "}",
  // ---------- 标题栏 ----------
  "body[data-dsh-ansk] .anskTitlebar{",
  "position:fixed;top:0;left:0;right:0;z-index:1000000;",
  "box-sizing:border-box;",
  "height:var(--ansk-titlebar-h);display:flex;align-items:center;gap:6px;",
  "padding:0 8px 0 var(--ansk-tl-pad);",
  "color:#fff;user-select:none;",
  "font:700 12px/var(--ansk-titlebar-h) 'Segoe UI','Microsoft YaHei','PingFang SC',sans-serif;",
  "background:linear-gradient(90deg,#ff9ec7 0%,#ffb6d8 40%,#8fb3ff 85%,#6fa8ff 100%);",
  "border-bottom:1px solid rgba(63,125,242,0.55);",
  "box-shadow:inset 0 1px rgba(255,255,255,0.5),0 2px 10px rgba(63,125,242,0.22);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskTitlebar{",
  "background:linear-gradient(90deg,#3a2540 0%,#4a3a66 45%,#2b3a66 100%);",
  "border-bottom-color:rgba(111,168,255,0.35);",
  "box-shadow:inset 0 1px rgba(255,255,255,0.12);",
  "}",
  "body[data-dsh-ansk] .anskTitlebarIcon{flex:none;display:inline-flex;align-items:center;}",
  "body[data-dsh-ansk] .anskTitlebarTitle{white-space:nowrap;text-overflow:ellipsis;flex:1;overflow:hidden;}",
  "body[data-dsh-ansk] .anskTitlebarBtn{",
  "color:#fff;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.35);",
  "flex:none;justify-content:center;align-items:center;width:22px;height:18px;margin-left:1px;",
  "font-size:11px;line-height:1;display:inline-flex;border-radius:4px;",
  "}",
  "body[data-dsh-ansk] .anskTitlebarBtn:hover{background:rgba(255,255,255,0.28);}",
  "body[data-dsh-ansk] .anskTitlebarBtn:active{background:rgba(255,255,255,0.1);}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskTitlebarBtn{",
  "background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.18);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskTitlebarBtn:hover{background:rgba(255,255,255,0.16);}",
  // ---------- 状态栏 ----------
  "body[data-dsh-ansk] .anskStatusbar{",
  "position:fixed;bottom:0;left:0;right:0;z-index:1000000;",
  "box-sizing:border-box;",
  "height:var(--ansk-statusbar-h);display:flex;align-items:stretch;",
  "color:#5a6a94;user-select:none;",
  "font:11px/var(--ansk-statusbar-h) 'Segoe UI','Microsoft YaHei','PingFang SC',sans-serif;",
  "background:rgba(255,255,255,0.72);border-top:1px solid rgba(111,168,255,0.4);",
  "backdrop-filter:blur(10px);",
  "-webkit-backdrop-filter:blur(10px);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskStatusbar{",
  "color:#a9b8d8;background:rgba(20,26,43,0.8);border-top-color:rgba(111,168,255,0.25);",
  "}",
  "body[data-dsh-ansk] .anskStatusbarWave{flex:none;display:inline-flex;align-items:center;padding:0 8px;}",
  "body[data-dsh-ansk] .anskStatusbarCell{",
  "white-space:nowrap;flex:none;padding:0 10px;",
  "border-right:1px solid rgba(111,168,255,0.35);",
  "box-shadow:1px 0 rgba(255,255,255,0.6);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] .anskStatusbarCell{",
  "border-right-color:rgba(111,168,255,0.18);",
  "box-shadow:1px 0 rgba(255,255,255,0.05);",
  "}",
  "body[data-dsh-ansk] .anskStatusbarSpacer{flex:1;}",
  // ---------- 细节 ----------
  "body[data-dsh-ansk] ::selection{background:#ff9ec7;color:#fff;}",
  "body[data-dsh-ansk][data-ds-dark-theme] ::selection{background:#6fa8ff;color:#fff;}",
  "body[data-dsh-ansk] .anskTitlebarBtn:focus-visible,body[data-dsh-ansk] [data-dsh-skin-chrome='titlebar']:focus-visible{outline:none;box-shadow:inset 0 0 0 2px #fff;}",
  "@media (prefers-reduced-motion:reduce){body[data-dsh-ansk] *{transition:none!important;}}",
  "body[data-dsh-ansk] .anskTitlebarBtn{transition:background .12s,box-shadow .12s;}",
  // ---------- 侧边栏列：粉蓝氛围渐变（不使用 backdrop-filter：设置面板是
  // sidebarCol 的 fixed 后代，blur 会把它钉进侧边栏而非视口居中） ----------
  "body[data-dsh-ansk] [class$='_sidebarCol']{",
  "background:linear-gradient(180deg,rgba(255,158,199,0.09) 0%,rgba(255,158,199,0.02) 32%,rgba(111,168,255,0.09) 100%),rgba(255,255,255,var(--ansk-op-sidebar,0.55));",
  "border-right:1px solid rgba(111,168,255,0.4);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol']{",
  "background:linear-gradient(180deg,rgba(255,158,199,0.05) 0%,rgba(111,168,255,0.05) 100%),rgba(20,26,43,var(--ansk-op-sidebar,0.5));",
  "border-right-color:rgba(111,168,255,0.22);",
  "}",
  // ---------- logo 行：粉蓝渐变横幅 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_logoRow']{",
  "background:linear-gradient(135deg,#ff9ec7 0%,#ffb6d8 42%,#8fb3ff 88%,#6fa8ff 100%);",
  "border-bottom:1px solid rgba(63,125,242,0.5);",
  "box-shadow:inset 0 1px rgba(255,255,255,0.5),0 2px 10px rgba(63,125,242,0.2);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_logoRow']{",
  "background:linear-gradient(135deg,#3a2540 0%,#4a3a66 45%,#2b3a66 100%);",
  "border-bottom-color:rgba(111,168,255,0.3);",
  "box-shadow:inset 0 1px rgba(255,255,255,0.1);",
  "}",
  // 注意：不强制 logoRow 内文字/svg 颜色——BrandWordmark 的 svg 全部
  // fill="currentColor"，跟随主题色（亮色深字 / 暗色浅字），强制白色会把
  // "HARNESS" 徽章板整个刷白成纯白块。
  // 注意：只对 BrandWordmark svg 本身刷白（currentColor→白：deepseek 字母/鲸鱼/
  // HARNESS 板全部白色）；HARNESS 文字渐变由 brand.js 注入 url(#anskBrandGrad)。
  // 不可用 `[class$='_logoRow'] *` 强制——会误伤其他组件。
  "body[data-dsh-ansk] svg[viewBox='0 0 182 24']{color:#fff;}",
  "body[data-dsh-ansk][data-ds-dark-theme] svg[viewBox='0 0 182 24']{color:#fff;}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_logoRow'] button{border-radius:8px;}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_logoRow'] button:hover{background:rgba(255,255,255,0.18);}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_logoRow'] button:hover{background:rgba(255,255,255,0.12);}",
  // ---------- 新建会话按钮：粉蓝渐变 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_newSession']{",
  "color:#fff;",
  "background:linear-gradient(135deg,#ff9ec7 0%,#ffb6d8 42%,#8fb3ff 100%);",
  "border:1px solid rgba(63,125,242,0.5);",
  "border-radius:10px;",
  "box-shadow:0 2px 10px rgba(63,125,242,0.22);",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_newSession']:hover{",
  "background:linear-gradient(135deg,#ffb0d0 0%,#ffc4de 42%,#9fc0ff 100%);",
  "box-shadow:0 3px 14px rgba(63,125,242,0.32);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_newSession']{",
  "background:linear-gradient(135deg,#5a3a66 0%,#6a4a80 45%,#3a5a96 100%);",
  "border-color:rgba(111,168,255,0.4);",
  "box-shadow:0 2px 10px rgba(0,0,0,0.4);",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_newSession'] svg{color:#fff;}",
  // ---------- 会话/项目树条目 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [role=treeitem]{",
  "border-radius:8px;",
  "transition:background .12s,color .12s,box-shadow .12s;",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [role=treeitem]:hover{background:rgba(255,158,199,0.16);}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [role=treeitem]:hover{background:rgba(255,158,199,0.12);}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class*='_selected']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.32),rgba(111,168,255,0.32))!important;",
  "box-shadow:inset 3px 0 0 #ff9ec7;",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class*='_selected']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.26),rgba(111,168,255,0.26))!important;",
  "box-shadow:inset 3px 0 0 #ff9ec7;",
  "}",
  // ---------- 搜索框 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_searchInput']{",
  "background:rgba(255,255,255,0.75);",
  "border:1px solid rgba(111,168,255,0.45);",
  "border-radius:8px;",
  "transition:border-color .12s,box-shadow .12s;",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_searchInput']:focus{",
  "border-color:#6fa8ff;box-shadow:0 0 0 3px rgba(111,168,255,0.25);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_searchInput']{",
  "background:rgba(255,255,255,0.06);",
  "border-color:rgba(111,168,255,0.3);",
  "}",
  // ---------- 分区标题 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_sectionLabel']{",
  "color:#4a5a86;font-weight:700;letter-spacing:.04em;",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_sectionLabel']{color:#a9b8d8;}",
  // ---------- 侧边栏滚动条：常驻粉蓝半透明，不随鼠标出现/消失。
  // 官方机制：悬停时 --dsh-scrollbar-thumb 为深色不透明条，移开 2s（linger）后
  // .quietBars 改为 transparent——用户感知为"侧边栏 2~3 秒后变不透明"。
  // 本规则 specificity (0,3,1) 高于 .root.quietBars (0,2,0)，常驻覆盖：
  // 变量 + 伪元素双保险（官方 scrollbar.css 与自定义路径都吃变量）。
  // ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_root']{",
  "--dsh-scrollbar-thumb:rgba(255,182,216,0.55);",
  "--dsh-scrollbar-thumb-hover:rgba(143,179,255,0.75);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_root']{",
  "--dsh-scrollbar-thumb:rgba(150,166,214,0.5);",
  "--dsh-scrollbar-thumb-hover:rgba(175,188,228,0.7);",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] ::-webkit-scrollbar{width:8px;height:8px;}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] ::-webkit-scrollbar-thumb{",
  "background:linear-gradient(180deg,rgba(255,182,216,0.55),rgba(143,179,255,0.55));border-radius:4px;",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] ::-webkit-scrollbar-thumb{",
  "background:linear-gradient(180deg,rgba(120,136,190,0.5),rgba(80,96,150,0.5));",
  "}",
  // ---------- footer 设置触发器 ----------
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_trigger']:hover{background:rgba(255,158,199,0.14);}",
  // ---------- 细节面板：半透明 + 粉蓝边框（同上，不用 backdrop-filter） ----------
  "body[data-dsh-ansk] [class$='_rightbarCol']{",
  "background:rgba(255,255,255,var(--ansk-op-details,0.55));",
  "border-left:1px solid rgba(111,168,255,0.35);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_rightbarCol']{",
  "background:rgba(20,26,43,var(--ansk-op-details,0.5));",
  "border-left-color:rgba(111,168,255,0.2);",
  "}",
  "body[data-dsh-ansk] [class$='_rightbarCol'] [class$='_header']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.16),rgba(111,168,255,0.16));",
  "border-bottom:1px solid rgba(111,168,255,0.3);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_rightbarCol'] [class$='_header']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.1),rgba(111,168,255,0.1));",
  "border-bottom-color:rgba(111,168,255,0.2);",
  "}",
  // ---------- 对话区 header：粉蓝渐变下沿 ----------
  "body[data-dsh-ansk] [class$='_centerCol'] [class$='_header']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.1),rgba(111,168,255,0.1));",
  "border-bottom:1px solid rgba(111,168,255,0.3);",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_centerCol'] [class$='_header']{",
  "background:linear-gradient(90deg,rgba(255,158,199,0.07),rgba(111,168,255,0.07));",
  "border-bottom-color:rgba(111,168,255,0.18);",
  "}",
  // ---------- 面板根节点半透明：让背景插画透出（对话区/树区/细节区各自的白底会盖住 body 背景图） ----------
  // 关键：AppFrame（_frame）本身是不透明白，必须透明化，否则 body 背景图被整块挡住。
  "body[data-dsh-ansk] [class$='_frame']{background:transparent!important;}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_frame']{background:transparent!important;}",
  "body[data-dsh-ansk] [class$='_centerCol'] [class$='_root']{",
  "background:rgba(255,255,255,var(--ansk-op-center,0.4));",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_centerCol'] [class$='_root']{",
  "background:rgba(20,26,43,var(--ansk-op-center,0.5));",
  "}",
  "body[data-dsh-ansk] [class$='_sidebarCol'] [class$='_root']{",
  "background:rgba(255,255,255,var(--ansk-op-sidebar,0.32));",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_sidebarCol'] [class$='_root']{",
  "background:rgba(20,26,43,var(--ansk-op-sidebar,0.42));",
  "}",
  "body[data-dsh-ansk] [class$='_rightbarCol'] [class$='_root']{",
  "background:rgba(255,255,255,var(--ansk-op-details,0.4));",
  "}",
  "body[data-dsh-ansk][data-ds-dark-theme] [class$='_rightbarCol'] [class$='_root']{",
  "background:rgba(20,26,43,var(--ansk-op-details,0.5));",
  "}",
  ""
].join("\n");

/** <style data-plugin-css> 的标签 id（去重键，仿官方 bundle）。 */
export const CSS_TAG = "ansk-skin/ansk.module.css";
