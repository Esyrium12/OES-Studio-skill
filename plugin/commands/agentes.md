---
description: Vigilador de agentes - qué subagentes trabajaron, cuántos tokens y tiempo usaron
argument-hint: "[días | sesion]"
---
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

- Si el argumento es "sesion": `node "<ruta>/scripts/report-agents.js" --sesion <session_id actual>`.
- Si es un número: `node "<ruta>/scripts/report-agents.js" --dias <n>`. Por defecto 1.
Mostrar la tabla y, en máximo 3 líneas, qué ajustar (agente que gasta de más, Opus usado donde alcanzaba Sonnet, agentes cortados sin terminar). Para ver en vivo: `/oes:panel start`.
