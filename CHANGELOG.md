# Cambios

## 1.3.0 — 2026-11-20
- Los 9 agentes (planner, implementer, reviewer, designer, tester, notes y los 3 del consejo) vienen dentro del plugin (`plugin/agents/`) y cargan solos como `oes:<agente>`, también en Claude Code en la nube. Solo `Explore` se sigue copiando a `~/.claude/agents/` (un agente de plugin no puede reemplazar al integrado).
- `/oes:setup` pasa a backup las copias viejas de esos agentes en `~/.claude/agents/` (si quedaran, aparecerían dos veces). Las copias editadas por vos no se tocan.
- Script de entorno para la nube: `plugin/scripts/cloud-setup.sh` y `docs/NUBE.md`.
- README: guía de instalación probada en Windows y problemas frecuentes.

## 1.2.0 — 2026-11-20
- Consejo OES (`/oes:consejo` y skill `consejo`): 5 asesores en paralelo, revisión cruzada anónima y veredicto del presidente (Opus). Modos `rapido`, `normal` y `profundo`. Basado en el LLM Council de Karpathy, en la versión de Ole Lehmann.
- Agentes nuevos: `consejero` (Sonnet), `revisor-consejo` (Haiku), `presidente` (Opus).
- Claude propone el consejo antes de decisiones caras o difíciles de revertir.
- Integración con `/oes:idea`, `/oes:opinion` y `planner`.

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
