---
description: Flujo completo para una funcionalidad nueva - plan, aprobación, implementación, pruebas y revisión
argument-hint: "<qué funcionalidad>"
---
Funcionalidad: $ARGUMENTS
Seguir el flujo de la sección 3 de la skill `oes-studio`: prompt mejorado → `Explore` (contexto) → `planner` (plan en `docs/plans/`) → **esperar aprobación** → `implementer` por fases (Opus si es código crítico) → `tester` → `designer` si hay UI → `reviewer` → resumen y actualizar `docs/estado.md`. Commit solo si el usuario lo pide.
