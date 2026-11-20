# Cambios

## Sin publicar
- `inventory.js` lee los conectores MCP de los plugins cargados (sincronizados desde claude.ai en `~/.claude/plugins/synced/` e instalados en `~/.claude/plugins/cache/`) y marca como `duplicado` el mismo servidor en dos plugins, o en un plugin y en tu config (usuario, local o proyecto), diciendo de qué plugin viene cada copia.
- Con el plugin oficial de Supabase cargado, el `supabase` de OES se reporta como sobrante (`/mcp disable plugin:oes:supabase`) y ya no se pide instalar Supabase agent-skills.
- Arreglo: la acción para quitar un conector de proyecto decía `-s proyecto`; ahora `-s project`.

## 1.1.0 — 2026-11-18
- Comandos cortos `/oes:`.
- Nuevos: `dato`, `idea`, `limite`, `continuar`, `resumen`, `analisis`, `opinion`, `social`, `feature`, `bug`, `commit`, `deploy`, `ayuda`.
- Aviso automático de límite de 5 h (90 %) y semanal (95 %).
- Detección de traspaso pendiente al abrir sesión.
- Equipo social: trend-scout, guionista, productor, publicador.

## 1.0.0 — 2026-11-18
- Equipo de subagentes (Explore, planner, implementer, reviewer, designer, tester, notes) con modelo por rol.
- Auditoría previa sin duplicados (`inventory.js`).
- Statusline, guardián de contexto, vigilador de agentes y panel visual.
- Instalador para Windows (`setup.ps1`).
