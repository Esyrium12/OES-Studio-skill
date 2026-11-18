---
description: Analizador de consumo de sesión (ventanas 5 h y semana, costo por día, modelo y proyecto)
argument-hint: "[días, por defecto 7]"
---
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

1. `node "<ruta>/scripts/report-usage.js" --dias N` (N = $ARGUMENTS; 7 si está vacío) (datos de la statusline OES).
2. `npx -y ccusage@latest blocks --active` y `npx -y ccusage@latest daily --breakdown --since <fecha de hace N días en AAAAMMDD>` (historial completo desde los logs locales de Claude Code, por modelo).
3. Responder en cavernícola:
   - Estado ahora (5 h, semana).
   - Tabla corta: día · tokens · costo equivalente · modelo que más gastó.
   - 3 recomendaciones concretas según lo que se ve (ej.: mucho Opus en lectura → más `Explore`; sesiones que llegan a 85 % → compactar antes; subagentes caros → ver `/oes:agentes`).
   - Recordar que el costo es "equivalente API" si usa suscripción.
