# Modelos: qué usar en cada lugar

## Por qué así
- Opus gasta la ventana de 5 h rápido. Usarlo solo para pensar.
- Sonnet escribe código casi igual de bien por mucho menos.
- Haiku lee y busca rápido y barato. Leer es lo que más tokens consume en repos grandes.
- El `Explore` integrado de Claude Code usa el modelo de la sesión (Opus). Por eso el plugin instala un `Explore` propio en `~/.claude/agents/` con `model: haiku`, que lo reemplaza.

## Asignación

| Trabajo | Modelo | Agente |
|---|---|---|
| Entender pedido, decidir, integrar | Opus | sesión principal |
| Plan de feature / refactor / arquitectura | Opus | `planner` |
| Bug difícil, de causa desconocida | Opus | sesión principal |
| Búsqueda, lectura, mapa del repo | Haiku | `Explore` |
| Escribir / editar código | Sonnet | `implementer` |
| Código crítico (auth, pagos, migraciones/RLS, concurrencia, stock en tiempo real) o 2 fallos de Sonnet | Opus | `implementer` con `model: opus` |
| Revisión de código y seguridad | Sonnet | `reviewer` |
| UI, páginas, animación | Sonnet | `designer` |
| Tests, E2E, build roto | Sonnet | `tester` |
| Notas, docs, README | Haiku | `notes` |

## Cuando se acaba la ventana
- Opus al 80 % de la ventana de 5 h → `/model sonnet` para la sesión principal y seguir; volver a Opus al reiniciar la ventana.
- Alternativa: `/model opusplan` (Opus en modo plan, Sonnet al ejecutar).

## Ajustes
- Cambiar el modelo de un agente: copiar `plugin/agents/<agente>.md` a `~/.claude/agents/` y editar `model:` (`haiku`, `sonnet`, `opus`, `inherit`). La copia se usa con el nombre sin prefijo. Para `Explore`, editar `~/.claude/agents/Explore.md`.
- No usar `CLAUDE_CODE_SUBAGENT_MODEL`: pisa la asignación por agente.
