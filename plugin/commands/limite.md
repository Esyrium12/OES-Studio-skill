---
description: Corta en el mejor punto antes del límite (sesión, 5 h o semanal) y deja guardado dónde seguir
---
Cerrar la sesión de forma ordenada porque se acerca un límite. Rápido y con pocos tokens.

1. **Mejor punto para cortar**: si hay una edición o comando a medias, terminar SOLO esa unidad (archivo que compile, test que corra). No arrancar nada nuevo. Si terminarla es largo, revertir esa unidad a medias y anotarla como siguiente paso.
2. **Verificación mínima**: build o typecheck rápido si existe (máx. 1 comando). Anotar el resultado.
3. **Guardar el traspaso** en `docs/handoff.md` (pisar el anterior) y copia en `~/.claude/oes/handoff/<carpeta-del-proyecto>.md`:
   ```markdown
   ---
   estado: pendiente
   fecha: AAAA-MM-DD HH:MM
   motivo: <contexto | 5 h | semanal>
   rama: <git branch>
   ---
   # Traspaso
   ## Objetivo de la tarea
   ## Hecho en esta sesión
   - archivo · qué cambió
   ## Quedó a medias
   - archivo:línea · qué falta exactamente
   ## Siguiente paso (exacto, primero esto)
   1. ...
   ## Decisiones pendientes del usuario
   ## Plan y docs relacionados
   - docs/plans/...
   ## Estado de verificación
   - build/tests: ...
   ```
4. Actualizar `docs/estado.md` (hecho / en curso / pendiente).
5. Si hay cambios sin commit: preguntar si hace commit WIP (`wip: <tema>`). No hacerlo sin respuesta.
6. Responder en máximo 6 líneas: hecho · siguiente paso · "Para seguir: abrí Claude Code en esta carpeta y escribí /oes:continuar". Luego detenerse: no ejecutar nada más.
