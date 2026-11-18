---
description: Analiza plugins, skills, conectores, agentes, hooks y config; dice qué sirve, qué no afecta y qué conviene quitar
---
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

1. Correr `node "<ruta>/scripts/inventory.js"` en la carpeta actual y mostrar la tabla.
2. Debajo, en 3 líneas máximo: lo más importante para quitar y por qué.
3. Preguntar con AskUserQuestion (multiSelect) qué quitar y qué instalar. No hacer cambios sin respuesta.
4. Ejecutar solo lo elegido (mismo procedimiento que el paso 3 y 4 de `/oes:setup`), con copia en `~/.claude/oes/backup/`.
5. Reglas al sumar algo nuevo en el futuro: si ya existe algo que hace lo mismo → avisar y no instalar el segundo.
