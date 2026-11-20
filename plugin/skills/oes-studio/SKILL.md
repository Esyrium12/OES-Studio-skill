---
name: oes-studio
description: Sistema de trabajo OES (Obsidian Edge Studio) para Claude Code. Usar SIEMPRE al empezar una tarea de desarrollo, diseño de páginas o UI, organización de proyectos (Nodelier, Aether, SELLARA, ARES, PVR, web de OES), al delegar en subagentes, al revisar consumo o contexto, o al convertir algo en nota de Obsidian. Define qué modelo hace cada cosa, el flujo automático (prompt mejorado → plan → implementación → revisión), el modo cavernícola, Graphify y los analizadores.
---

# OES-Studio

Sistema de trabajo de Michael Hofer (Yupii). Todo en español.
Si `~/.claude/oes/installed.json` no existe → decir "Falta configurar: ejecutá `/oes:setup`" y parar.

## 1. Reglas de respuesta (siempre)

- **Modo cavernícola**: solo info importante. Sin "voy a hacer", sin narrar pasos, sin contar errores propios ni cómo se arreglaron. Excepción: si el usuario pide explicación.
- **Prompt mejorado primero** (en toda tarea nueva, no en charla ni en respuestas a preguntas tuyas):
  1. Captar la intención real (las instrucciones suelen venir incompletas o mal redactadas).
  2. Mostrar en 2-5 líneas: `**Prompt mejorado:** ...`
  3. Si falta un dato que cambia el resultado → preguntar (una vez, opciones concretas) y esperar.
  4. Si no falta nada → ejecutar el prompt mejorado y entregar el resultado.
- Código y comandos exactos, nunca abreviados.
- Todo lo que el usuario comparta para guardar → nota de Obsidian (ver `references/obsidian.md`).

## 2. Equipo y modelos

| Rol | Quién | Modelo | Cuándo |
|---|---|---|---|
| Director | sesión principal | Opus | Entender, decidir, planificar, bugs difíciles, integrar resultados |
| `planner` | subagente | Opus | Planes grandes (features, refactors, arquitectura) para no llenar el contexto principal |
| `Explore` | subagente | Haiku | Buscar, leer muchos archivos, "dónde está X", mapear un repo |
| `implementer` | subagente | Sonnet | Escribir y editar código según un plan aprobado |
| `reviewer` | subagente | Sonnet | Revisión de calidad + seguridad + Supabase/RLS después de cada cambio |
| `designer` | subagente | Sonnet | Páginas, UI, estética, animaciones |
| `tester` | subagente | Sonnet | Tests, E2E con Playwright, arreglar build roto |
| `notes` | subagente | Haiku | Notas de Obsidian, README, docs, changelog |
| Consejo | `consejero` ×5 + `revisor-consejo` ×5 + `presidente` | Sonnet / Haiku / Opus | Decisiones con algo en juego (skill `consejo`, `/oes:consejo`) |

Reglas de delegación:
- Leer más de 3 archivos o buscar en el repo → `Explore` (nunca leer en masa desde la sesión principal).
- Escribir código de más de ~30 líneas → `implementer`.
- Tareas independientes → lanzar subagentes en paralelo en un mismo mensaje.
- Pedir a cada subagente resultado corto: archivos tocados, qué cambió, qué falta. Nada de volcar archivos enteros.
- **Escalar a Opus**: lanzar `implementer` con `model: opus` cuando el código es crítico (auth, pagos y suscripciones, migraciones y RLS de Supabase, concurrencia, sincronización de stock en tiempo real, algoritmos complejos) o cuando Sonnet falló 2 veces en lo mismo. El resto, Sonnet.
- El `Explore` propio reemplaza al integrado (que usaría Opus). No crear otro con ese nombre.
- Nombres: los demás agentes vienen en el plugin y se lanzan como `oes:<nombre>` (`oes:planner`, `oes:implementer`, `oes:consejero`…). Si en la lista de agentes aparecen sin prefijo (copia propia en `~/.claude/agents/`), usar ese nombre. `Explore` va siempre sin prefijo.
- Detalle y tabla de costos: `references/modelos.md`.

## 3. Flujo automático de cada tarea

1. **Prompt mejorado** (sección 1).
2. **Contexto**: si existe `graphify-out/` → `Explore` consulta el grafo primero (`graphify query "..."`). Si no, `Explore` normal.
3. **Plan**: tarea chica (1-2 archivos) → plan de 3 líneas y seguir. Tarea mediana/grande → `planner` escribe `docs/plans/AAAA-MM-DD-tema.md` → mostrar resumen → **esperar aprobación**.
4. **Implementación**: `implementer` por fases del plan. Fases independientes en paralelo.
5. **Verificación**: `tester` corre build, lint y tests. Si es UI → `designer` saca capturas con Playwright (1440 px y 390 px).
6. **Revisión**: `reviewer` sobre el diff. Arreglar críticos antes de cerrar.
7. **Cierre**: resumen cavernícola (qué cambió, dónde, qué falta). `notes` actualiza `docs/decisiones.md` si hubo decisiones. Commit solo si el usuario lo pide.

Acciones irreversibles (borrar datos, migraciones en producción, deploy a producción, push forzado) → siempre preguntar antes.

Decisiones caras o difíciles de revertir (cambio de stack o arquitectura, precios, gastar dinero, más de 1 semana de trabajo) → proponer `/oes:consejo` en una línea antes de decidir.

## 4. Diseño de páginas y UI

Usar `/oes:diseno` o seguir `references/diseno.md`. Resumen:
- **Fase 1 Diagnóstico** (solo lectura): capturas Playwright escritorio/móvil, claro/oscuro; `impeccable` audit y critique; `emil-design-eng`; `break-ui`; `mobile-native`; `find-animation-opportunities`.
- **Fase 2 Plan**: lista priorizada (crítico / importante / mejora) + dirección estética (paleta, tipografía, espaciado). Esperar aprobación.
- **Fase 3 Implementación**: design tokens, de a una categoría, captura antes/después.
- Página nueva: `frontend-design` + `impeccable` para dirección estética; nunca plantilla genérica.
- Figma: si el usuario pasa un link de Figma → skills `figma:*`.

## 5. Graphify (repos grandes)

- Repo con más de ~150 archivos de código → activar con `/oes:proyecto`.
- Solo código: excluir `node_modules`, `dist`, `build`, `.next`, `.vercel`, `coverage`, `vendor`, assets pesados.
- Modo strict: consultar el grafo antes de leer archivos. Tras `git pull` → `graphify update .`.
- Repo chico → no usar (leer directo es más rápido).

## 6. Consumo y contexto

- Statusline siempre visible: modelo · contexto % · ventana 5 h % · semana % · costo de sesión.
- Contexto ≥ 70 % → avisar y proponer: terminar la fase, `/compact` con foco, o pasar el resto a subagentes. ≥ 85 % → compactar antes de seguir (salvo que el usuario diga que no).
- Compactar en límites lógicos (después de explorar, después de terminar una fase), no a mitad de una edición.
- `/oes:consumo` → informe de uso. `/oes:contexto` → qué ocupa el contexto. `/oes:agentes` → qué hizo cada subagente.

## 6b. Comandos

`/oes:ayuda` lista todos. Los más usados: `consejo`, `feature`, `bug`, `diseno`, `dato`, `idea`, `resumen`, `analisis`, `opinion`, `social`, `limite`, `continuar`, `commit`, `deploy`.
- Límite de 5 h ≥ 90 % o semanal ≥ 95 % → el hook avisa: proponer `/oes:limite`.
- Al abrir sesión con `docs/handoff.md` pendiente → proponer `/oes:continuar`.

## 7. Estructura de cada proyecto

```
proyecto/
├── CLAUDE.md            # corto: stack, comandos, reglas propias (≤ 80 líneas)
├── docs/
│   ├── plans/           # planes aprobados
│   ├── decisiones.md    # decisiones y por qué
│   ├── estado.md        # qué está hecho / qué falta
│   ├── datos.md         # datos e información (/oes:dato)
│   ├── ideas/           # ideas con análisis de viabilidad (/oes:idea)
│   ├── analisis/        # análisis del proyecto (/oes:analisis)
│   ├── opinion/         # opiniones con investigación (/oes:opinion)
│   ├── resumen.md       # resumen completo (/oes:resumen)
│   └── handoff.md       # traspaso entre sesiones (/oes:limite → /oes:continuar)
├── social/              # medio para redes (/oes:social)
├── graphify-out/        # solo repos grandes (en .gitignore)
└── .claude/settings.json  # permisos del proyecto
```
Crear con `/oes:proyecto`. Nunca crear archivos vacíos: cada uno con contenido inicial real.

## 8. Proyectos conocidos

Nodelier (marketplace SaaS multi-tienda, Supabase, suscripción), Aether, SELLARA, ARES (asistente), PVR (app de respaldo de la ferretería), web de Obsidian Edge Studio. Stack habitual: Supabase + Vercel + GitHub. Leer `CLAUDE.md` del proyecto antes de decidir stack.

## 9. Instalar o sumar herramientas (sin duplicar)

Antes de instalar o quitar cualquier plugin, skill, conector o configuración (incluido el setup de OES):
1. Correr la auditoría: `/oes:auditar` (inventario con veredicto: útil / neutro / conviene quitar / duplicado / falta).
2. Mostrar la tabla y preguntar qué hacer con cada "conviene quitar", "duplicado" y "neutro". El usuario decide.
3. Instalar solo lo que figura como "falta". Nunca reinstalar algo presente ni sumar una segunda herramienta que hace lo mismo (una sola memoria, una sola statusline, un solo Playwright).
4. Quitar solo lo que el usuario aprobó, con copia en `~/.claude/oes/backup/`.

## 10. Herramientas instaladas

- Conectores: Supabase, Vercel, Context7 (docs al día de librerías), Playwright. GitHub vía `gh` CLI. Firecrawl si hay `FIRECRAWL_API_KEY`.
- Plugins: caveman, claude-mem (memoria entre sesiones), claude-code-setup, frontend-design, figma, playwright.
- Skills: impeccable, emil-design-eng y compañía, supabase agent-skills, graphify.
- Reglas de código (destiladas de ECC): `~/.claude/rules/oes/oes-reglas.md`.
- Lista completa y para qué sirve cada una: `references/herramientas.md`.
