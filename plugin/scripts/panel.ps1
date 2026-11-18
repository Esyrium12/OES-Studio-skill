# Panel visual de agentes (disler/claude-code-hooks-multi-agent-observability).
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File panel.ps1 start|stop|status
param([ValidateSet('start', 'stop', 'status')][string]$Accion = 'status')
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $env:USERPROFILE '.claude' }
$Oes = Join-Path $ClaudeDir 'oes'
$Obs = Join-Path $Oes 'observability'
$Flag = Join-Path $Oes 'dashboard.on'
function Get-PortPids($ports) { Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort } | Select-Object -ExpandProperty OwningProcess -Unique }

switch ($Accion) {
  'start' {
    if (-not (Test-Path (Join-Path $Obs 'apps\server'))) { Write-Host 'Panel no instalado: ejecuta /oes:setup'; exit 1 }
    if (-not (Get-PortPids @(4000))) { Start-Process bun -ArgumentList 'run', 'start' -WorkingDirectory (Join-Path $Obs 'apps\server') -WindowStyle Minimized }
    if (-not (Get-PortPids @(5173))) { Start-Process bun -ArgumentList 'run', 'dev' -WorkingDirectory (Join-Path $Obs 'apps\client') -WindowStyle Minimized }
    New-Item -ItemType File -Force -Path $Flag | Out-Null
    Start-Sleep -Seconds 4
    Start-Process 'http://localhost:5173'
    Write-Host 'Panel encendido: http://localhost:5173 (servidor en :4000). Los eventos de todas tus sesiones ya se envian.'
  }
  'stop' {
    Remove-Item $Flag -ErrorAction SilentlyContinue
    Get-PortPids @(4000, 5173) | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host 'Panel apagado. El registro local de agentes sigue activo.'
  }
  'status' {
    $on = Test-Path $Flag; $srv = [bool](Get-PortPids @(4000)); $cli = [bool](Get-PortPids @(5173))
    Write-Host "Envio de eventos: $(if($on){'encendido'}else{'apagado'}) | servidor :4000: $(if($srv){'arriba'}else{'abajo'}) | panel :5173: $(if($cli){'arriba'}else{'abajo'})"
  }
}
