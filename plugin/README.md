# OES-Studio-skill

Sistema de trabajo de Obsidian Edge Studio para Claude Code en Windows. Arma un equipo de subagentes con el modelo justo para cada tarea (Opus piensa, Sonnet codea, Haiku lee), instala conectores, plugins y skills sin duplicar lo que ya tenés, y suma un flujo automático (prompt mejorado → plan → implementación → revisión), un flujo de diseño de páginas en 3 fases, modo cavernícola, Graphify, vigilador de agentes con panel visual y analizadores de consumo y contexto.

## Instalar (Windows)

1. Cloná el repo en un lugar fijo: `git clone https://github.com/Esyrium12/OES-Studio-skill.git "$env:USERPROFILE\OES-Studio-skill"`.
2. En Claude Code:
   ```
   /plugin marketplace add C:\Users\<vos>\OES-Studio-skill
   /plugin install oes@oes-studio
   ```
3. Reiniciá Claude Code y escribí `/oes:setup`. Primero muestra la auditoría de lo que ya tenés; vos elegís qué quitar y qué instalar.
4. Reiniciá Claude Code otra vez. Después: `gh auth login` (si hace falta) y `/mcp` para autorizar Supabase y Vercel.

Guía completa: [README del repo](../README.md) · [Comandos en detalle](../docs/COMANDOS.md)

## Comandos

| Comando | Para qué |
|---|---|
| /oes:setup | Instalar o actualizar todo (con auditoría previa) |
| /oes:auditar | Revisar plugins, skills, conectores y config: qué sirve, qué quitar |
| /oes:proyecto | Estructura OES en el proyecto (+ Graphify si es grande) |
| /oes:feature | Funcionalidad nueva con plan, aprobación, código, pruebas y revisión |
| /oes:bug | Encontrar y arreglar un error |
| /oes:diseno | Diseño de página o app en 3 fases |
| /oes:dato | Guardar un dato o información |
| /oes:idea | Registrar una idea y analizar su viabilidad |
| /oes:consejo | Consejo de 5 asesores con revisión anónima y veredicto |
| /oes:resumen | Resumen completo: hecho, por hacer, ideas, recomendaciones, tus tareas |
| /oes:analisis | Buscar errores, mejoras, qué perfeccionar y qué quitar |
| /oes:opinion | Opinión neutral con datos del proyecto y del mercado |
| /oes:social | Medio para redes con equipo autónomo de videos |
| /oes:commit | Revisar y commitear (push opcional) |
| /oes:deploy | Desplegar en Vercel (producción con confirmación) |
| /oes:limite | Cortar antes del límite y guardar dónde seguir |
| /oes:continuar | Retomar desde el último traspaso |
| /oes:consumo | Uso de 5 h / semana y costo |
| /oes:contexto | Qué ocupa el contexto y cómo liberarlo |
| /oes:agentes | Qué hizo cada subagente |
| /oes:panel start\|stop\|status | Panel visual de agentes en vivo (localhost:5173) |
| /oes:nota | Convertir contenido en notas de Obsidian |
| /oes:ayuda | Esta lista |

## Qué instala

- **Agentes** (en el plugin, `oes:<agente>`; Explore en `~/.claude/agents/`): Explore (Haiku), planner (Opus), implementer (Sonnet; Opus en código crítico), reviewer, designer, tester (Sonnet), notes (Haiku) y el consejo: consejero (Sonnet), revisor-consejo (Haiku), presidente (Opus).
- **Conectores**: Supabase, Vercel, Context7 (en el plugin), Playwright (plugin oficial), Firecrawl si definís `FIRECRAWL_API_KEY`. GitHub con `gh`.
- **Plugins**: caveman, claude-mem, claude-code-setup, frontend-design, figma, playwright.
- **Skills**: impeccable (con hook de diseño), Emil Kowalski (emil-design-eng, animate, review-animations, improve-animations, find-animation-opportunities, apple-design, mobile-native, break-ui, animation-vocabulary, pick-ui-library), Supabase agent-skills, Graphify.
- **Configuración**: bloque OES en `~/.claude/CLAUDE.md` (respeta lo tuyo), reglas de código en `~/.claude/rules/oes/`, statusline OES. Todo lo reemplazado queda en `~/.claude/oes/backup/`.

## Privacidad

Los scripts propios solo escriben en `~/.claude/oes/` en tu PC. El panel de agentes corre en `localhost`. Los conectores remotos (Supabase, Vercel, Context7) se rigen por las políticas de cada servicio.

## Créditos

Reglas destiladas de [Everything Claude Code](https://github.com/affaan-m/ECC) (MIT, Affaan Mustafa); originales en `ecc-reference/`. Panel: [disler/claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability).

## Desinstalar

`/plugin uninstall oes@oes-studio`, borrar `~/.claude/agents/Explore.md`, el bloque entre `<!-- OES:START -->` y `<!-- OES:END -->` de `~/.claude/CLAUDE.md`, la `statusLine` de `~/.claude/settings.json` y la carpeta `~/.claude/oes/`.
