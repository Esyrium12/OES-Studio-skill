---
name: consejo
description: Consejo de 5 asesores para decisiones con algo en juego. Analizan por separado, se revisan entre sí en forma anónima y un presidente da el veredicto. Usar con "consejo", "pasalo por el consejo", "council", "debatí esto", "poné a prueba esto", o ante dudas reales como "¿hago X o Y?", "¿cuál opción?", "¿es buena idea?", "no me decido". También proponerlo (sin ejecutarlo solo) antes de decisiones caras o difíciles de revertir: cambio de stack o arquitectura, precios, inversión de dinero, más de una semana de trabajo. No usar para preguntas de una sola respuesta, datos o tareas de creación.
---

# Consejo OES

Método de Andrej Karpathy (LLM Council) en la versión de Ole Lehmann para Claude: varios puntos de vista que discuten, se revisan sin saber quién dijo qué, y una síntesis final que no esquiva la respuesta. Sirve para no quedarse con la primera opinión, que suele darte la razón.

Límite honesto: los 5 asesores son el mismo modelo con distinto enfoque, no modelos independientes. Reduce el sesgo de "decirte que sí", pero no lo elimina. Lo que vale es la discusión de las razones.

## Cuándo sí y cuándo no
- Sí: hay una decisión real, con opciones, incertidumbre y un costo si sale mal.
- No: preguntas de dato ("¿qué versión de Node uso?"), tareas ("escribí un post"), o cosas triviales → responder directo.
- Antes de decisiones grandes (cambio de stack, precio de Nodelier, gastar dinero, borrar o migrar datos, más de 1 semana de trabajo) → proponer el consejo en una línea; ejecutarlo solo si el usuario dice que sí.

## Modos
| Modo | Asesores | Revisión cruzada | Investigación | Costo aprox. |
|---|---|---|---|---|
| `rapido` | 3 (Contrario, Primeros principios, Ejecutor) | no | no | bajo |
| `normal` (por defecto) | 5 | sí | no | medio |
| `profundo` | 5 | sí | sí: `Explore` trae datos del proyecto y 3-6 búsquedas web antes de empezar | alto |

Si la ventana de 5 h está ≥ 80 % (ver `~/.claude/oes/state/`), sugerir `rapido`.

## Los 5 asesores (enfoques, no personajes)
1. **El Contrario**: busca el error fatal, lo que falta, lo que va a fallar. Si todo parece bien, cava más hondo.
2. **Primeros principios**: pregunta qué se está intentando resolver de verdad. Quita supuestos y rearma el problema. A veces su aporte es "la pregunta está mal planteada".
3. **El Expansionista**: busca el lado positivo que nadie ve. ¿Qué pasa si sale mejor de lo esperado? ¿Qué oportunidad vecina hay?
4. **El de Afuera**: no conoce tu rubro ni tu historia. Responde solo a lo que tiene enfrente. Detecta lo que para vos es obvio y para un cliente no.
5. **El Ejecutor**: ¿se puede hacer y cuál es el camino más rápido? ¿Qué hacés el lunes a la mañana?

Tensiones buscadas: Contrario vs. Expansionista (riesgo vs. potencial), Primeros principios vs. Ejecutor (repensar vs. hacer). El de Afuera mantiene a todos honestos.

## Proceso

### 1. Preparar la pregunta
- Leer en 30 segundos lo que dé contexto: `CLAUDE.md`, `docs/estado.md`, `docs/datos.md`, `docs/decisiones.md`, `docs/ideas/`, consejos anteriores en `docs/consejo/` (no repetir uno ya hecho sin decirlo), archivos que el usuario nombró.
- Modo `profundo`: además `Explore` (datos del código o la base) y 3-6 búsquedas web con fuentes.
- Escribir la **pregunta enmarcada**, neutral, sin opinión propia: decisión central · contexto del usuario · contexto de los archivos (etapa, números, límites, resultados previos) · qué está en juego.
- Si es demasiado vaga: una sola pregunta aclaratoria, después seguir.
- Mostrar la pregunta enmarcada en 2-4 líneas (cumple el "prompt mejorado").

### 2. Ronda de asesores (en paralelo, un solo mensaje)
Lanzar los asesores a la vez con el agente `consejero`. Cada uno recibe su enfoque y la pregunta enmarcada:

```
Sos <NOMBRE> en el Consejo OES.
Tu enfoque: <descripción del asesor>.
Pregunta del consejo:
---
<pregunta enmarcada>
---
Respondé solo desde tu enfoque. Directo y concreto, sin equilibrar ni suavizar: los otros asesores cubren los demás ángulos. Si ves un error fatal, decilo; si ves mucho potencial, decilo. 150-300 palabras, en español, sin introducción.
```

### 3. Revisión cruzada anónima (modos normal y profundo, en paralelo)
- Mezclar al azar y etiquetar las respuestas como A-E (que la letra no delate al asesor).
- Lanzar 5 agentes `revisor-consejo` a la vez. Cada uno ve todas las respuestas anónimas y contesta, citando por letra, en menos de 200 palabras:
  1. ¿Cuál es la más sólida y por qué?
  2. ¿Cuál tiene el punto ciego más grande y cuál es?
  3. ¿Qué se les pasó a TODAS?

### 4. Veredicto del presidente
Un agente `presidente` (Opus) recibe: pregunta enmarcada, respuestas con el nombre de cada asesor y todas las revisiones. Puede ir contra la mayoría si el argumento de la minoría es mejor (y lo explica). Prohibido "depende".

### 5. Mostrar en el chat
```markdown
## Veredicto del consejo: <tema corto>

### Dónde coinciden
### Dónde chocan
### Puntos ciegos que encontró la revisión
### Recomendación
### Lo primero que tenés que hacer
```
Viñetas, escaneable. Si el tema toca dinero o temas legales: una línea aclarando que no es asesoramiento profesional.

### 6. Guardar
- Siempre en `docs/consejo/AAAA-MM-DD-<tema>.md` (o en Obsidian con `notes` si no hay proyecto): pregunta enmarcada, modo, respuestas, revisiones y veredicto.
- Si el usuario adopta la recomendación → una línea en `docs/decisiones.md` con link al consejo.

## Integraciones OES
- `/oes:idea`: si el puntaje queda en zona gris o el usuario lo pide → consejo `rapido` para el veredicto.
- `/oes:opinion`: puede cerrar con un consejo `normal` sobre la recomendación principal.
- `planner`: si un plan tiene una decisión de arquitectura con dos caminos razonables → proponer consejo antes de aprobar.
- `/oes:agentes` muestra el costo de cada consejo (agentes `consejero`, `revisor-consejo`, `presidente`).

Créditos: método de [Andrej Karpathy](https://github.com/karpathy/llm-council); versión para Claude de [Ole Lehmann](https://github.com/aiwithremy/claude-skills-llm-council). Esta es una reescritura propia en español adaptada al sistema OES.
