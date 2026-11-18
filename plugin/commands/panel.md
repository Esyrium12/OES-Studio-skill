---
description: Enciende, apaga o consulta el panel visual de agentes en tiempo real (localhost:5173)
argument-hint: "start | stop | status"
---
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

Ejecutar `powershell -NoProfile -ExecutionPolicy Bypass -File "<ruta>/scripts/panel.ps1" <acción>` (acción = $ARGUMENTS; status si está vacío) y mostrar el resultado en una línea.
El panel recibe eventos de todas las sesiones y proyectos mientras esté encendido (no hace falta configurar cada proyecto). Apagado no consume nada.
