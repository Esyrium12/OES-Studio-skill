# Comandos OES

Todos se escriben en Claude Code. Los que reciben un argumento lo llevan después del comando, por ejemplo `/oes:idea agregar pagos con Mercado Pago`.

---

## Instalación y mantenimiento

### `/oes:setup`
**Para qué:** instalar o actualizar todo el sistema.
**Cómo funciona:**
1. Si falta Node, instala los requisitos con winget (Node, Git, uv, gh, Bun).
2. Corre la auditoría (`inventory.js`) y te muestra qué tenés.
3. Te pregunta qué quitar, qué no instalar y si querés el panel.
4. Quita solo lo aprobado, con copia en `~/.claude/oes/backup/`.
5. Instala solo lo que falta (`setup.ps1`); lo que ya está no se duplica.
6. Vuelve a auditar y te dice los pasos manuales: reiniciar, `gh auth login` y `/mcp`.
**Opción:** `--sin-panel`.

### `/oes:auditar`
**Para qué:** saber qué tenés instalado y qué conviene hacer con cada cosa.
**Cómo funciona:** revisa plugins, skills, conectores MCP, agentes, hooks, statusline, variables y CLAUDE.md. Clasifica cada elemento:
- **útil:** parte del sistema o necesario.
- **neutro:** no molesta; decidís vos.
- **conviene quitar:** pisa algo, falla o no aplica (ej. OmniRoute, MemPalace, `CLAUDE_CODE_SUBAGENT_MODEL`).
- **duplicado:** dos cosas que hacen lo mismo (dos Playwright, skill y plugin iguales, dos statuslines).
- **falta:** se instala con el setup.

No cambia nada sin tu respuesta.

### `/oes:proyecto`
**Para qué:** dejar un proyecto organizado.
**Cómo funciona:** detecta el stack y los comandos. Crea `CLAUDE.md` corto (o completa el tuyo sin pisarlo) y `docs/` con decisiones, estado y planes. Configura los permisos del proyecto. Si tiene más de ~150 archivos de código, activa Graphify en modo strict con hook de git.
**Genera:** `CLAUDE.md`, `docs/decisiones.md`, `docs/estado.md`, `docs/plans/`, `.claude/settings.json`.

---

## Desarrollo

### `/oes:feature <qué>`
**Para qué:** construir una funcionalidad nueva de punta a punta.
**Cómo funciona:** prompt mejorado → `Explore` → `planner` (plan) → **tu aprobación** → `implementer` por fases (Opus si es código crítico) → `tester` → `designer` si hay UI → `reviewer` → resumen.
**Genera:** `docs/plans/AAAA-MM-DD-tema.md`, y actualiza `docs/estado.md`.

### `/oes:bug <qué falla>`
**Para qué:** arreglar un error desde la causa, no el síntoma.
**Cómo funciona:** reproduce el error, ubica el código con `Explore`, busca la causa con Opus, escribe un test que falle, aplica el arreglo mínimo y verifica.

### `/oes:diseno <página o descripción>`
**Para qué:** diseñar o mejorar páginas y apps.
**Cómo funciona:**
- **Página nueva:** dirección estética (frontend-design + impeccable), tokens, mobile-first.
- **Página existente:** 3 fases.
  1. Diagnóstico: capturas en 1440/390 px, claro y oscuro, con impeccable, emil-design-eng, break-ui y mobile-native.
  2. Plan priorizado, que tenés que aprobar.
  3. Implementación con capturas antes/después.

### `/oes:commit [push]`
**Para qué:** commitear con seguridad.
**Cómo funciona:**
- Excluye `.env` y builds.
- `reviewer` revisa el diff; si hay algo crítico, frena.
- Agrupa los commits con mensajes convencionales en español.
- Hace push solo si lo pedís, y nunca forzado a main.

### `/oes:deploy [preview|produccion]`
**Para qué:** publicar en Vercel.
**Cómo funciona:**
- Verifica build, tests y variables de entorno.
- Lista las migraciones pendientes.
- El preview sale directo.
- Producción solo con tu "sí", y después revisa los errores de runtime.
- Te dice cómo volver atrás.

---

## Conocimiento y estrategia

### `/oes:dato <dato>`
**Para qué:** guardar información para que no se pierda.
**Cómo funciona:**
- Clasifica el dato: regla, técnico, negocio, contacto o referencia.
- Lo guarda en `docs/datos.md`. Si es una regla, agrega además una línea en `CLAUDE.md`. Fuera de un proyecto, lo guarda en Obsidian.
- Si contradice algo ya guardado, pregunta cuál vale.
- Nunca guarda secretos: solo el nombre de la variable de entorno.

### `/oes:idea <idea>`
**Para qué:** saber si una idea vale la pena antes de invertir tiempo.
**Cómo funciona:**
- Revisa qué existe hoy en el proyecto e investiga en la web.
- Puntúa valor, esfuerzo, riesgo, encaje con el stack y costo.
- Calcula: puntaje = valor × encaje ÷ (esfuerzo + riesgo).
- Propone alternativas mínimas.
- Da un veredicto: **hacer ahora / hacer después / versión mínima / descartar**.
**Genera:** `docs/ideas/AAAA-MM-DD-slug.md` y el índice `docs/ideas/README.md`.

### `/oes:resumen`
**Para qué:** foto completa del proyecto.
**Cómo funciona:** junta docs, planes, ideas, commits, TODOs, issues y PRs. Escribe: qué es, hecho, en curso, por hacer priorizado, ideas, recomendaciones y **qué tenés que hacer vos**.
**Genera:** `docs/resumen.md`.

### `/oes:analisis`
**Para qué:** encontrar todo lo que está mal o se puede mejorar.
**Cómo funciona:** subagentes en paralelo revisan:
- código muerto y duplicado;
- seguridad y RLS;
- build, tests y cobertura;
- UI y accesibilidad;
- rendimiento;
- dependencias (`npm audit`);
- advisors de Supabase y errores de Vercel.

Clasifica cada hallazgo como error, mejorar, perfeccionar o quitar, con prioridad y esfuerzo. Solo lee; no cambia código.
**Genera:** `docs/analisis/AAAA-MM-DD.md`.

### `/oes:opinion`
**Para qué:** una mirada neutral sobre hacia dónde llevar el proyecto.
**Cómo funciona:**
- Combina el último análisis con 8 a 15 búsquedas: competidores, precios, tendencias, regulación y opiniones de usuarios.
- Separa hechos de estimaciones y da argumentos en contra de cada recomendación.
- Propone qué modificar, qué agregar, qué dejar de hacer y un plan a 30 y 90 días con métricas.
**Genera:** `docs/opinion/AAAA-MM-DD.md` con fuentes.

---

## Redes

### `/oes:social [configurar|ciclo|aprobar|estado]`
**Para qué:** tener un medio en redes que funcione casi solo.
**Cómo funciona:**
- **configurar:**
  - Te pregunta marca, redes, objetivo, público, tono, colores y referencias.
  - Crea `social/` con `estilo.md` y `config.json`, e instala 4 agentes en el proyecto:
    - `trend-scout` (Haiku): busca tendencias y formatos virales del nicho. Solo como referencia, nunca re-sube videos ajenos.
    - `guionista` (Sonnet): escribe guiones con tu estilo.
    - `productor` (Sonnet): arma el video vertical con voz de ElevenLabs, montaje con Remotion o ffmpeg, subtítulos y miniatura.
    - `publicador` (Haiku): publica por API oficial o por un servicio de programación.
  - Programa el ciclo diario con el Programador de tareas de Windows.
- **ciclo:** tendencias → guiones → videos → publicación.
- **aprobar:** elegís qué videos de la cola se publican.
- **estado:** publicados, cola, errores y qué formato rindió mejor.

**Modo por red:** `aprobacion` (por defecto) o `autonomo` (solo si lo activás), con un máximo de publicaciones por día.
**Reglas:** el contenido IA realista se etiqueta; nada de spam ni de likes, comentarios o follows automáticos.

---

## Sesión, consumo y contexto

### `/oes:limite`
**Para qué:** que el corte por límite no te haga perder trabajo.
**Cómo funciona:**
- Termina solo la unidad en curso, o la revierte si es larga, y hace una verificación rápida.
- Guarda el traspaso en `docs/handoff.md` (y una copia en `~/.claude/oes/handoff/`): hecho, a medias con archivo:línea, siguiente paso exacto y decisiones pendientes.
- Actualiza `docs/estado.md` y pregunta si hace un commit WIP.
- Después se detiene.

**Automático:** con la ventana de 5 h al 90 % o la semana al 95 %, Claude te lo propone.

### `/oes:continuar`
**Para qué:** retomar en una sesión nueva sin volver a explicar nada.
**Cómo funciona:** lee el traspaso, verifica que el repo coincida, te muestra en 4 líneas dónde estabas y sigue. Al abrir una sesión con un traspaso pendiente, Claude te lo propone solo.

### `/oes:consumo [días]`
**Para qué:** saber en qué se va tu uso.
**Cómo funciona:** junta los datos de la statusline con los logs locales (vía `ccusage`). Muestra la ventana de 5 h, la semana y el costo por día, modelo y proyecto, más 3 recomendaciones.

### `/oes:contexto`
**Para qué:** liberar contexto.
**Cómo funciona:** estima lo que se carga fijo en cada sesión (CLAUDE.md, reglas, descripciones de skills y agentes, conectores). Propone acciones ordenadas por ahorro. La medición exacta en vivo es `/context`.

### `/oes:agentes [días|sesion]`
**Para qué:** ver qué hizo cada subagente.
**Cómo funciona:** muestra una tabla por agente con lanzamientos, tokens, tiempo y modelo forzado, y los últimos 10 trabajos.

### `/oes:panel start|stop|status`
**Para qué:** ver a los agentes trabajar en vivo.
**Cómo funciona:** levanta el panel en `localhost:5173`, que recibe los eventos de todas tus sesiones. Apagado no consume nada.

---

## Notas

### `/oes:nota <contenido>`
**Para qué:** convertir cualquier cosa en notas de Obsidian.
**Cómo funciona:** `notes` (Haiku) crea notas con frontmatter, enlaces `[[así]]`, etiquetas y MOC, y nunca archivos vacíos. La bóveda se pregunta una vez y queda guardada.

### `/oes:ayuda`
Muestra la lista de comandos.
