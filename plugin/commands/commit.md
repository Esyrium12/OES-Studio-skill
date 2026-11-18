---
description: Revisa el diff y hace commit con mensaje convencional (y push si lo pedís)
argument-hint: "[push]"
---
1. `git status` y `git diff`. Si hay archivos que no deberían ir (`.env*`, secretos, builds, `graphify-out/`) → avisar y excluirlos.
2. `reviewer` sobre el diff. Si hay algo CRÍTICO → mostrar y no commitear hasta que el usuario decida.
3. Agrupar en commits lógicos con mensaje convencional (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`) en español.
4. Commit. Push solo si el argumento es `push` ($ARGUMENTS); nunca forzado a main.
5. Responder: commits creados (hash corto + mensaje).
