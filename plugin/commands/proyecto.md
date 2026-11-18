---
description: Crea o adapta la estructura OES en el proyecto actual (CLAUDE.md, docs, Graphify si es grande)
argument-hint: "[nombre del proyecto]"
---
Organizar el proyecto de la carpeta actual con el sistema OES. Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}` (si no se expande, `~/.claude/oes/plugin-root.txt`).

1. `Explore`: detectar stack (package.json, framework, Supabase, Vercel), comandos (dev, build, test, lint), estructura principal y cantidad de archivos de código (sin node_modules, dist, build, .next, .vercel, coverage).
2. Si ya existe `CLAUDE.md`: no pisarlo; proponer solo lo que le falta. Si no existe: crearlo desde `templates/proyecto/CLAUDE.md` con datos reales (≤ 80 líneas). Nombre: `$ARGUMENTS` o el de la carpeta.
3. Crear `docs/decisiones.md`, `docs/estado.md` (con contenido real, desde las plantillas) y `docs/plans/` con un `README.md` de una línea. Nunca archivos vacíos.
4. Más de ~150 archivos de código → Graphify:
   - `graphify install --project --strict`
   - En Claude Code: `/graphify .` (solo código; excluir las carpetas de arriba y assets pesados)
   - `graphify hook install` (se actualiza en cada commit)
   - Agregar `graphify-out/` a `.gitignore`.
   Menos de ~150 → no instalar y decirlo en una línea.
5. `.claude/settings.json` del proyecto: permitir comandos habituales (dev, build, test, lint, git status/diff) y denegar lectura de `.env*`.
6. Resumen: archivos creados y si Graphify quedó activo.
