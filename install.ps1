# 爱祥皮肤 — DSH Desktop 安装辅助脚本（Windows PowerShell）
#
# 用法（在仓库根目录运行）：
#   powershell -ExecutionPolicy Bypass -File .\install.ps1
#   powershell -ExecutionPolicy Bypass -File .\install.ps1 -Profile desktop
#
# 它做三件事：
#   1. 校验当前目录确实是可安装的组合包（package.json 的 dsh.bundle + exports["./client"] + client.js）
#   2. 检查目标 profile 是否存在（默认 desktop），并报告残留的旧版皮肤中心痕迹
#   3. 打印精确的安装命令 / GUI 步骤
#
# 为什么不直接写 profile：现版 DSH 的组合包安装由 profile 包管理器完成（它会跑 pnpm、
# 写 profile/package.json 的 dependencies 与 dsh.profile.bundles，并在失败时回滚）。
# 手改 profile 文件属于「绕过管理器」，容易留下半装状态——旧版脚本正是这么坏的。

param(
  [string]$Profile = "desktop"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$allGood = $true

Write-Host ""
Write-Host "爱祥皮肤 (ansk-skin) — DSH Desktop 组合包" -ForegroundColor Magenta
Write-Host "包目录: $root"
Write-Host ""

# ---------- 1. 校验组合包 ----------
$pkgPath = Join-Path $root "package.json"
if (-not (Test-Path $pkgPath)) {
  Write-Host "[x] 找不到 package.json -- 请在仓库根目录运行本脚本" -ForegroundColor Red
  exit 1
}
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json

if ($pkg.name -ne "ansk-skin") {
  Write-Host "[!] 包名不是 ansk-skin（实际: $($pkg.name)）-- 可能不是本皮肤仓库" -ForegroundColor Yellow
  $allGood = $false
}

if (-not $pkg.dsh.bundle.patch) {
  Write-Host "[x] package.json 缺少 dsh.bundle.patch -- 不是组合包，装进去不会成为 profile 组合层" -ForegroundColor Red
  Write-Host "    （若你刚跑过 node build.mjs --no-patch，请先跑 node build.mjs 恢复）" -ForegroundColor Yellow
  exit 1
}

if (-not $pkg.exports.'./client') {
  Write-Host "[x] package.json 缺少 exports['./client'] -- 浏览器侧产物无处可寻" -ForegroundColor Red
  exit 1
}

if (-not $pkg.dsh.client.platform -or $pkg.dsh.client.platform -ne "web") {
  Write-Host "[x] dsh.client.platform 必须是 'web'" -ForegroundColor Red
  exit 1
}

foreach ($f in @("client.js", "index.js", "cordis.patch.yml")) {
  if (-not (Test-Path (Join-Path $root $f))) {
    Write-Host "[x] 缺少 $f -- 先运行: npm install; npm run build" -ForegroundColor Red
    exit 1
  }
}

$clientKb = [math]::Round((Get-Item (Join-Path $root "client.js")).Length / 1KB)
Write-Host "[v] 组合包结构完整: $($pkg.name) v$($pkg.version)" -ForegroundColor Green
Write-Host "    组合包 patch: $($pkg.dsh.bundle.patch) -> 行 ui-skin-ansk"
Write-Host "    浏览器产物: client.js ($clientKb KB)"
Write-Host ""

# 产物新鲜度提醒
$clientTime = (Get-Item (Join-Path $root "client.js")).LastWriteTime
$srcTime = (Get-ChildItem (Join-Path $root "src") -Recurse -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
if ($srcTime -gt $clientTime) {
  Write-Host "[!] src/ 比 client.js 新 -- 可能忘了重新构建: npm run build" -ForegroundColor Yellow
  Write-Host ""
}

# ---------- 2. 检查 profile ----------
$homeDir = if ($env:DSH_HOME -and $env:DSH_HOME.Trim() -ne "") { $env:DSH_HOME.Trim() } else { Join-Path $env:USERPROFILE ".dsh" }
$profileDir = Join-Path $homeDir "profiles\$Profile"

if (Test-Path $profileDir) {
  Write-Host "[v] profile 存在: $profileDir" -ForegroundColor Green
  $profilePkg = Join-Path $profileDir "package.json"
  if (Test-Path $profilePkg) {
    $pp = Get-Content $profilePkg -Raw | ConvertFrom-Json
    $bundles = @($pp.dsh.profile.bundles)
    if ($bundles -contains "ansk-skin") {
      Write-Host "    已安装并在组合包列表中（重装可直接覆盖；重装后需重启 App 才会加载新的 client.js）"
    } else {
      Write-Host "    尚未安装"
    }
  }
  # 旧版残留检查
  $legacy = @()
  if (Test-Path (Join-Path $profileDir "node_modules\@linxin666\dsh-plugin-skin-ansk")) { $legacy += "node_modules\@linxin666\dsh-plugin-skin-ansk" }
  if (Test-Path (Join-Path $profileDir "node_modules\@linxin666\dsh-skins")) { $legacy += "node_modules\@linxin666\dsh-skins（旧载具）" }
  if (Test-Path (Join-Path $profileDir "node_modules\ansk-skin-src")) { $legacy += "node_modules\ansk-skin-src（旧 git 根包）" }
  if ($legacy.Count -gt 0) {
    Write-Host "[!] 发现旧版安装残留（现版 DSH 已无皮肤中心/dsh-skins，建议清理）:" -ForegroundColor Yellow
    foreach ($l in $legacy) { Write-Host "      $l" }
    Write-Host "    清理: 在 GUI 插件页卸载旧条目，或用 dsh plugin 命令删除对应包"
  }
  $patch = Join-Path $profileDir "cordis.patch.yml"
  if ((Test-Path $patch) -and (Select-String -Path $patch -Pattern "skin-center|dsh-skins" -Quiet)) {
    Write-Host "[!] cordis.patch.yml 里仍有旧版皮肤中心痕迹，建议删掉相关行" -ForegroundColor Yellow
  }
} else {
  Write-Host "[!] 未找到 profile: $profileDir" -ForegroundColor Yellow
  Write-Host "    请确认 DSH Desktop 至少启动过一次；Web 版 profile 名通常是 web"
  $allGood = $false
}
Write-Host ""

# ---------- 3. 安装指引 ----------
Write-Host "安装方式（任选其一）：" -ForegroundColor Cyan
Write-Host ""
Write-Host "A) 让 agent 装（推荐）-- 对 harness 里的 agent 说："
Write-Host "   「把 $root 作为组合包装进 $Profile profile」"
Write-Host "   它会调用 plugin_manager:"
Write-Host "     { ""action"": ""install_bundle"", ""target"": ""$root"" }"
Write-Host "   注意 target 必须是绝对路径。"
Write-Host ""
Write-Host "B) GUI 装 -- 侧边栏 -> 插件 -> 安装 -> 填入上面的绝对路径 -> 安装并启用。"
Write-Host ""
if (Get-Command dsh -ErrorAction SilentlyContinue) {
  Write-Host "C) CLI 装（检测到 dsh 命令）："
  Write-Host "   dsh plugin --profile $Profile install ""$root"""
} else {
  Write-Host "C) CLI 装 -- 未检测到 dsh 命令（Desktop 版通常不暴露）；用 A 或 B。"
}
Write-Host ""
Write-Host "生效：首次安装由 HMR 直接激活，刷新页面即可；重新构建过 client.js 之后需要重启 App。" -ForegroundColor Cyan
Write-Host ""

if ($allGood) { exit 0 } else { exit 1 }
