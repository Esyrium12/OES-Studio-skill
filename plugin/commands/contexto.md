---
description: Analizador de contexto (qué ocupa la ventana y cómo liberarla)
---
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

1. Decir en una línea que la medición exacta en vivo es `/context` (el usuario la escribe; Claude no puede ejecutarla).
2. Correr `node "<ruta>/scripts/context-audit.js" "<carpeta actual>"`: contexto fijo estimado (CLAUDE.md, reglas, descripciones de skills y agentes, conectores).
3. Leer el % actual de `~/.claude/oes/state/<session_id>.json` si existe.
4. Responder: tabla de lo que más ocupa + acciones concretas ordenadas por ahorro:
   - CLAUDE.md largo → resumir o `caveman-compress`.
   - Skills o conectores que no usa → `/oes:auditar`.
   - Sesión > 70 % → cerrar fase y `/compact <foco>`; o `/clear` si cambia de tarea.
   - Lecturas grandes → delegar a `Explore` / usar Graphify.
