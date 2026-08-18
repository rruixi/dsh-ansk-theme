# dsh 爱祥主题 一键安装脚本（Windows PowerShell）
# 用法：解压 zip 后，在该目录运行：
#   powershell -ExecutionPolicy Bypass -File .\install.ps1
# 说明：安装皮肤包到 dsh 的 web profile（默认 web），注册皮肤中心列表条目，
#       并写入 cordis.patch.yml 激活爱祥皮肤。刷新页面（Ctrl+F5）即生效。
param(
  [string]$Profile = "web"
)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# ---------- 1. 定位 harness home 与 profile ----------
$homeDir = if ($env:DSH_HOME -and $env:DSH_HOME.Trim() -ne "") { $env:DSH_HOME.Trim() } else { Join-Path $env:USERPROFILE ".dsh" }
$profileDir = Join-Path $homeDir "profiles\$Profile"
$nm = Join-Path $profileDir "node_modules"
if (-not (Test-Path $profileDir)) {
  Write-Host "[dsh-ansk] 未找到 profile: $profileDir" -ForegroundColor Red
  Write-Host "         请确认 dsh 已运行过，或指定 -Profile <name>（如 -Profile web）" -ForegroundColor Yellow
  exit 1
}
Write-Host "[dsh-ansk] harness home : $homeDir"
Write-Host "[dsh-ansk] profile      : $Profile"

# ---------- 2. 安装皮肤包 ----------
$dist = Join-Path $root "dist"
if (-not (Test-Path (Join-Path $dist "package.json"))) {
  Write-Host "[dsh-ansk] 缺少 dist/（皮肤包产物），请确认解压完整或先执行 node build.mjs" -ForegroundColor Red
  exit 1
}

# 2a. 若存在 dsh-skins 载具 → 装入载具 skins/ansk + junction
$carrier = Join-Path $nm "@linxin666\dsh-skins\skins"
$linkPath = Join-Path $nm "@linxin666\dsh-client-ui-skin-ansk"
if (Test-Path $carrier) {
  $target = Join-Path $carrier "ansk"
  New-Item -ItemType Directory -Path $target -Force | Out-Null
  Copy-Item -Recurse -Force (Join-Path $dist "*") $target
  Write-Host "[dsh-ansk] 已装入 dsh-skins 载具: $target"
  if (-not (Test-Path $linkPath)) {
    New-Item -ItemType Junction -Path $linkPath -Target $target | Out-Null
    Write-Host "[dsh-ansk] 已建立包名链接: $linkPath"
  } else {
    Write-Host "[dsh-ansk] 包名链接已存在，跳过"
  }
} else {
  # 2b. 无载具 → 独立包目录
  $standalone = Join-Path $nm "@linxin666\dsh-client-ui-skin-ansk"
  New-Item -ItemType Directory -Path $standalone -Force | Out-Null
  Copy-Item -Recurse -Force (Join-Path $dist "*") $standalone
  Write-Host "[dsh-ansk] 已安装独立包: $standalone"
}

# ---------- 3. 皮肤中心注册表补丁（列表可见，幂等） ----------
$sc = Join-Path $nm "@linxin666\dsh-client-ui-skin-center\lib\client.js"
if (Test-Path $sc) {
  $text = [System.IO.File]::ReadAllText($sc)
  if ($text.Contains('"ansk"')) {
    Write-Host "[dsh-ansk] 皮肤中心注册表已含 ansk，跳过补丁"
  } else {
    $bak = $sc + ".bak-ansk"
    [System.IO.File]::Copy($sc, $bak, $true)
    $marker = "const SKIN_CENTER_ENTRIES = ["
    $start = $text.IndexOf($marker)
    if ($start -ge 0) {
      $arrStart = $text.IndexOf("[", $start)
      $depth = 0; $end = -1
      for ($i = $arrStart; $i -lt $text.Length; $i++) {
        $ch = $text[$i]
        if ($ch -eq "{") { $depth++ }
        elseif ($ch -eq "}") { $depth-- }
        elseif ($ch -eq "]" -and $depth -eq 0) { $end = $i; break }
      }
      if ($end -ge 0 -and $text.Substring(0, $end).TrimEnd().EndsWith("}")) {
        $entry = ",`n`t`t{`n`t`t`t`"id`": `"ansk`",`n`t`t`t`"name`": `"爱祥`",`n`t`t`t`"nameEn`": `"Anon × Sakiko`",`n`t`t`t`"author`": `"rruixi`",`n`t`t`t`"tagline`": `"粉蓝星轨 · 吉他 × 钢琴 · 爱音 × 祥子`",`n`t`t`t`"accent`": `"#6fa8ff`",`n`t`t`t`"bodyAttr`": `"data-dsh-ansk`",`n`t`t`t`"package`": `"@linxin666/dsh-client-ui-skin-ansk`",`n`t`t`t`"order`": 99`n`t`t}"
        $patched = $text.Substring(0, $end) + $entry + $text.Substring($end)
        [System.IO.File]::WriteAllText($sc, $patched, (New-Object System.Text.UTF8Encoding($false)))
        Write-Host "[dsh-ansk] 皮肤中心注册表已追加 ansk 条目（备份 $bak）"
      } else {
        Write-Host "[dsh-ansk] 警告：注册表结构异常，未打补丁（可手动处理）" -ForegroundColor Yellow
      }
    }
  }
} else {
  Write-Host "[dsh-ansk] 未发现 skin-center，跳过注册表补丁（皮肤仍可经 API/命令激活）" -ForegroundColor Yellow
}

# ---------- 4. 激活：写入 cordis.patch.yml 的 dsh-skin managed 区段 ----------
$patchFile = Join-Path $profileDir "cordis.patch.yml"
$managedStart = "# --- dsh-skin managed (auto-generated; do not edit) ---"
$managedEnd = "# --- end dsh-skin managed ---"
$managedBlock = @(
  $managedStart,
  "- id: ui-skin-ansk",
  "  disabled: false",
  "- insert:",
  "    - id: ui-skin-ansk",
  "      name: '@linxin666/dsh-client-ui-skin-ansk'",
  $managedEnd
) -join "`n"
if (Test-Path $patchFile) {
  $patch = [System.IO.File]::ReadAllText($patchFile)
  if ($patch.Contains($managedStart)) {
    # 替换 managed 区段为激活 ansk（其余皮肤由用户自行在皮肤中心管理）
    $s = $patch.IndexOf($managedStart); $e = $patch.IndexOf($managedEnd, $s)
    if ($e -ge 0) {
      $patch = $patch.Substring(0, $s) + $managedBlock + $patch.Substring($e + $managedEnd.Length)
      [System.IO.File]::WriteAllText($patchFile, $patch, (New-Object System.Text.UTF8Encoding($false)))
      Write-Host "[dsh-ansk] cordis.patch.yml 已更新：激活爱祥皮肤"
    }
  } else {
    $patch = $patch.TrimEnd() + "`n`n" + $managedBlock + "`n"
    [System.IO.File]::WriteAllText($patchFile, $patch, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[dsh-ansk] cordis.patch.yml 已追加 managed 区段：激活爱祥皮肤"
  }
} else {
  Write-Host "[dsh-ansk] 未找到 cordis.patch.yml，跳过激活（可打开 设置 → 皮肤中心 → 爱祥 → Apply）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[dsh-ansk] 安装完成！请刷新 dsh 浏览器页面（Ctrl+F5）" -ForegroundColor Green
Write-Host "[dsh-ansk] 设置 → 皮肤中心 → 爱祥（可试穿/应用）" -ForegroundColor Green
Write-Host "[dsh-ansk] 设置 → 爱祥背景：位置/大小/透明度/上传多图/图库/排序/重命名" -ForegroundColor Green
