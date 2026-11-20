# Herramientas de OES-Studio

## Conectores (MCP)
| Conector | Para qué | Cómo entra |
|---|---|---|
| Supabase | Base de datos, migraciones, logs, advisors (Nodelier) | Plugin (`.mcp.json`), login OAuth con `/mcp` |
| Vercel | Deploys, logs de runtime, dominios | Plugin, login OAuth con `/mcp` |
| Context7 | Documentación actualizada de librerías | Plugin, sin login |
| Playwright | Manejar el navegador: capturas, formularios, E2E | Plugin oficial `playwright` |
| Firecrawl | Leer cualquier web, extraer kit de marca, comparar competencia | Solo si existe `FIRECRAWL_API_KEY` (setup lo agrega) |
| GitHub | Repos, PRs, issues | `gh` CLI (no MCP: menos contexto, mismo resultado) |

Descartados por ahora: Perplexity, PostHog, Composio.

## Plugins
| Plugin | Para qué |
|---|---|
| caveman | Respuestas cortas + subagentes "cavecrew" |
| claude-mem | Memoria entre sesiones ("cerebro" de los agentes) |
| claude-code-setup | Recomienda mejoras de configuración por proyecto (solo lectura) |
| frontend-design | Dirección estética de interfaces |
| figma | Diseño ↔ código con Figma |
| playwright | Conector de navegador |

## Skills
| Skill | Para qué |
|---|---|
| impeccable | Auditar, criticar y pulir UI (+ hook de diseño) |
| emil-design-eng, animate, review-animations, improve-animations, find-animation-opportunities, apple-design, mobile-native, break-ui, animation-vocabulary, pick-ui-library | Pulido, movimiento y robustez de UI |
| supabase agent-skills | Buenas prácticas y seguridad de Supabase |
| graphify | Grafo del repo para leer menos archivos |

Excluidas: write-swift, animate-expo, ask-sonner (no aplican a tus proyectos).

## Propio del plugin
- Skill `consejo` + agentes `consejero`, `revisor-consejo`, `presidente` (método LLM Council de Karpathy / Ole Lehmann).
- Statusline OES (modelo, contexto, ventanas, costo).
- Guardián de contexto (aviso a 70 % y 85 %).
- Vigilador de agentes (registro local + panel visual opcional).
- Comandos: setup, proyecto, diseno, consumo, contexto, agentes, nota, panel.
- Reglas de código destiladas de ECC (MIT, Affaan Mustafa) en `~/.claude/rules/oes/oes-reglas.md`; originales en `ecc-reference/`.
- Auditoría previa: inventario con veredicto antes de instalar (`/oes:auditar`).
