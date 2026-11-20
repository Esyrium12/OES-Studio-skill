---
description: Instala y configura todo OES-Studio (auditoría previa, sin duplicar)
argument-hint: "[--sin-panel]"
---
Configurar OES-Studio en esta PC (Windows). Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}`. Si aparece literal (sin expandir), leerla de `~/.claude/oes/plugin-root.txt`; si tampoco existe, buscar `oes-studio/**/scripts/setup.ps1` dentro de `~/.claude/plugins/`.

Pasos, en orden, respuestas en modo cavernícola:

0. **Requisitos**: si `node --version` falla → `powershell -NoProfile -ExecutionPolicy Bypass -File "<ruta>/scripts/setup.ps1" -OnlyPrereqs` (instala Node, Git, uv, gh y Bun con winget). Si después `node` sigue sin aparecer, pedir que reinicie Claude Code y repita `/oes:setup`.
1. **Auditoría previa** (no cambia nada): `node "<ruta>/scripts/inventory.js"` desde la carpeta actual. Mostrar la tabla tal cual.
2. **Decisión del usuario**: con AskUserQuestion (multiSelect) preguntar:
   - Qué elementos "conviene quitar" y "duplicado" quitar (opción recomendada: los de "conviene quitar").
   - Qué elementos de "falta" NO instalar (por defecto: instalar todos).
   - Si instala el panel visual de agentes (recomendado: sí).
   Esperar respuesta. No quitar ni instalar nada sin esto.
3. **Quitar lo aprobado** (solo eso), con copia previa en `~/.claude/oes/backup/`:
   - plugin: `claude plugin uninstall <nombre>`
   - conector: `claude mcp remove <nombre> -s <user|local|project>`
   - conector de un plugin (`plugin:<plugin>:<servidor>`, ej. `plugin:oes:supabase` cuando está el plugin oficial de Supabase): no se borra con `claude mcp remove`; pasarlo a la lista del paso 6 (`/mcp disable <nombre>`, lo hace el usuario)
   - skill: mover la carpeta de `~/.claude/skills/<nombre>` a `~/.claude/oes/backup/skills/`
   - config o hook: editar `~/.claude/settings.json` (copia antes)
4. **Instalar lo que falta**:
   `powershell -NoProfile -ExecutionPolicy Bypass -File "<ruta>/scripts/setup.ps1" -Exclude <lo que el usuario no quiso, separado por comas>` (agregar `-NoDashboard` si no quiere el panel o si se pasó `--sin-panel`).
   El script ya saltea lo instalado: nunca duplica.
5. **Verificar**: volver a correr `inventory.js` y mostrar solo el resumen y lo que quedó en "falta" o "error".
6. **Pasos que solo puede hacer el usuario** (decirlos en una lista corta):
   - Reiniciar Claude Code.
   - `gh auth login` en su terminal si GitHub figura sin sesión.
   - `/mcp` → autorizar Supabase y Vercel.
   - Si la auditoría marcó un conector `plugin:...` como duplicado y lo aprobó para quitar: `/mcp disable <nombre>` (vale para el proyecto actual; repetirlo en cada proyecto).
   - Opcional: definir `FIRECRAWL_API_KEY` en variables de entorno de Windows y repetir `/oes:setup`.
