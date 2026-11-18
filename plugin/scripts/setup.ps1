# OES-Studio - instalador para Windows (PowerShell 5.1+).
# Idempotente: instala solo lo que falta (segun la auditoria) y no duplica.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File setup.ps1 [-Exclude nombre1,nombre2] [-NoDashboard] [-DryRun] [-OnlyPrereqs]
param(
  [string[]]$Exclude = @(),
  [switch]$NoDashboard,
  [switch]$DryRun,
  [switch]$OnlyPrereqs
)
$ErrorActionPreference = 'Continue'
# -File pasa "a,b,c" como un solo texto: separar por comas
$Exclude = @($Exclude | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Root = Split-Path -Parent $PSScriptRoot
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $env:USERPROFILE '.claude' }
$Oes = Join-Path $ClaudeDir 'oes'
New-Item -ItemType Directory -Force -Path $Oes | Out-Null
$Results = New-Object System.Collections.ArrayList

function Add-Result($que, $estado) { [void]$Results.Add([pscustomobject]@{ Que = $que; Estado = $estado }) }
function Test-Cmd($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Update-SessionPath {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
  $extra = @((Join-Path $env:USERPROFILE '.local\bin'), (Join-Path $env:USERPROFILE '.bun\bin'), (Join-Path $env:LOCALAPPDATA 'Programs\nodejs'))
  foreach ($e in $extra) { if ((Test-Path $e) -and ($env:Path -notlike "*$e*")) { $env:Path += ";$e" } }
}
function Is-Excluded($name) { foreach ($x in $Exclude) { if ($name -like "*$x*") { return $true } }; return $false }
function Invoke-Step($que, [scriptblock]$sb, [scriptblock]$Check = $null) {
  if (Is-Excluded $que) { Add-Result $que 'omitido (elegido por vos)'; return }
  if ($DryRun) { Add-Result $que 'se instalaria (simulacion)'; return }
  $global:LASTEXITCODE = 0
  try {
    & $sb 2>&1 | ForEach-Object { Write-Host "   $_" }
    $code = $LASTEXITCODE
    if ($Check) { if (& $Check) { Add-Result $que 'instalado' } else { Add-Result $que "error (codigo $code)" } }
    elseif ($code -ne 0) { Add-Result $que "error (codigo $code)" } else { Add-Result $que 'instalado' }
  } catch { Add-Result $que ('error: ' + $_.Exception.Message) }
}

Write-Host '== OES-Studio: preparando ==' -ForegroundColor Cyan
Update-SessionPath

# ---------- 1. Herramientas de terminal ----------
$cli = [ordered]@{ node = 'OpenJS.NodeJS.LTS'; git = 'Git.Git'; uv = 'astral-sh.uv'; gh = 'GitHub.cli'; bun = 'Oven-sh.Bun' }
$hasWinget = Test-Cmd 'winget'
foreach ($k in $cli.Keys) {
  if (Test-Cmd $k) { Add-Result "cli $k" 'ya estaba'; continue }
  if (-not $hasWinget) { Add-Result "cli $k" 'falta winget: instalalo a mano'; continue }
  $id = $cli[$k]
  Invoke-Step "cli $k" { winget install -e --id $id --accept-source-agreements --accept-package-agreements --silent }
  Update-SessionPath
}
if (-not (Test-Cmd 'node')) { Add-Result 'node' 'NO disponible: cerra y abri la terminal y repeti /oes:setup'; $Results | Format-Table -AutoSize | Out-String -Width 220 | Write-Host; exit 1 }
if (-not (Test-Cmd 'claude')) { Add-Result 'claude CLI' 'no encontrado en PATH'; }
if ($OnlyPrereqs) { $Results | Format-Table -AutoSize | Out-String -Width 220 | Write-Host; Write-Host 'Requisitos listos. Volve a ejecutar /oes:setup.'; exit 0 }

# ---------- 2. Graphify ----------
if (Test-Cmd 'graphify') { Add-Result 'graphify' 'ya estaba' }
elseif (Test-Cmd 'uv') {
  Invoke-Step 'graphify' { uv tool install graphifyy; uv tool update-shell } { Update-SessionPath; Test-Cmd 'graphify' }
  Update-SessionPath
}
else { Add-Result 'graphify' 'falta uv' }
if ((Test-Cmd 'graphify') -and -not $DryRun -and -not (Is-Excluded 'graphify')) {
  $skillG = Join-Path $ClaudeDir 'skills\graphify'
  if (Test-Path $skillG) { Add-Result 'graphify skill' 'ya estaba' } else { Invoke-Step 'graphify skill' { graphify install } }
}

# ---------- 3. Auditoria: que falta ----------
$invJson = node (Join-Path $PSScriptRoot 'inventory.js') --json
$inv = $invJson | ConvertFrom-Json
$faltanPlugins = @($inv.faltan.plugins)
$faltanSkills = @($inv.faltan.skills)

# ---------- 4. Plugins ----------
if ($faltanPlugins.Count -gt 0 -and (Test-Cmd 'claude')) {
  $markets = @{ 'caveman' = 'JuliusBrussee/caveman'; 'thedotmack' = 'thedotmack/claude-mem'; 'claude-plugins-official' = 'anthropics/claude-plugins-official' }
  $known = Join-Path $ClaudeDir 'plugins\known_marketplaces.json'
  $knownTxt = if (Test-Path $known) { Get-Content $known -Raw } else { '' }
  $needed = $faltanPlugins | ForEach-Object { ($_ -split '@')[1] } | Select-Object -Unique
  foreach ($m in $needed) {
    if ($knownTxt -match [regex]::Escape("`"$m`"")) { continue }
    if ($markets.ContainsKey($m) -and -not $DryRun) { claude plugin marketplace add $markets[$m] 2>&1 | Out-Null }
  }
  foreach ($p in $faltanPlugins) { Invoke-Step "plugin $p" { claude plugin install $p } }
  # claude-mem: deja su lanzador listo en Windows (hooks sin Git Bash)
  if (($faltanPlugins -contains 'claude-mem@thedotmack') -and -not (Is-Excluded 'claude-mem') -and -not $DryRun) { npx -y claude-mem install 2>&1 | Out-Null }
} else { Add-Result 'plugins' 'nada que instalar' }

# ---------- 5. Skills ----------
$emil = @($faltanSkills | Where-Object { $_ -ne 'impeccable' -and $_ -ne 'supabase' } | Where-Object { -not (Is-Excluded $_) })
if ($emil.Count -gt 0) {
  $argsS = @('-y', 'skills@latest', 'add', 'emilkowalski/skills', '-g', '-a', 'claude-code', '-y')
  foreach ($s in $emil) { $argsS += @('-s', $s) }
  Invoke-Step ('skills Emil: ' + ($emil -join ', ')) { npx @argsS }
}
if ($faltanSkills -contains 'impeccable') { Invoke-Step 'skill impeccable (+ hook de diseno)' { npx -y impeccable@latest install --providers=claude --global -y } }
if ($faltanSkills -contains 'supabase') { Invoke-Step 'skills supabase' { npx -y skills@latest add supabase/agent-skills -g -a claude-code -y } }
if ($faltanSkills.Count -eq 0) { Add-Result 'skills' 'nada que instalar' }

# ---------- 6. Firecrawl (solo con API key) ----------
if ($env:FIRECRAWL_API_KEY -and (Test-Cmd 'claude')) {
  claude mcp get firecrawl *> $null
  if ($LASTEXITCODE -eq 0) { Add-Result 'conector firecrawl' 'ya estaba' }
  else { Invoke-Step 'conector firecrawl' { claude mcp add firecrawl -s user -e "FIRECRAWL_API_KEY=$env:FIRECRAWL_API_KEY" -- cmd /c npx -y firecrawl-mcp } }
} else { Add-Result 'conector firecrawl' 'omitido (sin FIRECRAWL_API_KEY)' }

# ---------- 7. Archivos OES: agentes, reglas, CLAUDE.md, statusline ----------
if (-not $DryRun) {
  Write-Host '== Archivos OES ==' -ForegroundColor Cyan
  $flags = @()
  if (Is-Excluded 'agentes') { $flags += '--no-agents' }
  if (Is-Excluded 'statusline') { $flags += '--no-statusline' }
  if (Is-Excluded 'claudemd') { $flags += '--no-claudemd' }
  node (Join-Path $PSScriptRoot 'oes-install.js') @flags
}

# ---------- 8. Panel visual de agentes (opcional) ----------
$obs = Join-Path $Oes 'observability'
if ($NoDashboard -or (Is-Excluded 'panel')) { Add-Result 'panel de agentes' 'omitido' }
elseif (Test-Path (Join-Path $obs 'apps\server\node_modules')) { Add-Result 'panel de agentes' 'ya estaba' }
elseif ((Test-Cmd 'git') -and (Test-Cmd 'bun')) {
  Invoke-Step 'panel de agentes' {
    if (-not (Test-Path $obs)) { git clone --depth 1 https://github.com/disler/claude-code-hooks-multi-agent-observability.git $obs }
    Push-Location (Join-Path $obs 'apps\server'); bun install; Pop-Location
    Push-Location (Join-Path $obs 'apps\client'); bun install; Pop-Location
  }
} else { Add-Result 'panel de agentes' 'falta git o bun' }

# ---------- 9. Cuentas ----------
if (Test-Cmd 'gh') {
  gh auth status *> $null
  if ($LASTEXITCODE -eq 0) { Add-Result 'GitHub (gh)' 'sesion iniciada' } else { Add-Result 'GitHub (gh)' 'falta login: ejecuta  gh auth login  en tu terminal' }
}
Add-Result 'Supabase / Vercel' 'login: en Claude Code escribi /mcp y autoriza cada uno'

Write-Host ''
Write-Host '== Resultado ==' -ForegroundColor Cyan
$Results | Format-Table -AutoSize | Out-String -Width 220 | Write-Host
Write-Host 'Reinicia Claude Code para cargar plugins, agentes y statusline.' -ForegroundColor Yellow
