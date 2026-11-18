# Cambios

## Sin publicar
- Auditoría (`inventory.js`): reconoce los plugins sincronizados desde claude.ai (`~/.claude/plugins/synced`, `<nombre>@synced`) y ya no los marca como "falta" ni los reinstala con `setup.ps1`.
- `supabase agent-skills` cuenta como presente si un plugin (p. ej. `supabase@synced`) ya trae la skill `supabase`.
- `~/.claude/skills/synced` deja de listarse como skill; se leen las skills reales que tiene adentro. `session-start-hook` figura como integrada.
- Las skills de plugins sincronizados entran en la detección de duplicados.

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
