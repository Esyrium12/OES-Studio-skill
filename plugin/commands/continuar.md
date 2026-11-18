---
description: Retoma el trabajo desde el último traspaso guardado (/oes:limite)
---
1. Leer `docs/handoff.md` (o `~/.claude/oes/handoff/<carpeta>.md` si no está). Si no hay traspaso: leer `docs/estado.md` y el último plan de `docs/plans/`.
2. Verificar que el repo coincide: `git status`, rama y que los archivos de "quedó a medias" existan. Si algo cambió desde el traspaso, avisar.
3. Mostrar en 4 líneas: objetivo · hecho · siguiente paso · decisiones pendientes. Si hay decisiones pendientes, preguntarlas primero.
4. Continuar con el siguiente paso siguiendo el flujo OES.
5. Al terminar la tarea del traspaso: cambiar `estado: pendiente` por `estado: retomado AAAA-MM-DD` en `docs/handoff.md`.
