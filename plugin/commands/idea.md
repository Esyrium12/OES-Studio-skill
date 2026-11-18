---
description: Registra una idea y analiza su viabilidad para implementarla
argument-hint: "<idea>"
---
Idea: $ARGUMENTS

1. Prompt mejorado: reformular la idea en 2 líneas (qué es y qué problema resuelve). Si es ambigua, preguntar una vez.
2. Contexto: `Explore` revisa qué existe hoy en el proyecto relacionado (código, tablas, pantallas) y `docs/ideas/` para ver si ya hay una parecida (si existe, ampliar esa, no duplicar).
3. Investigación breve (3-6 búsquedas): cómo lo resuelven otros, librerías o servicios, costos, riesgos legales o de plataforma.
4. Análisis en `docs/ideas/AAAA-MM-DD-<slug>.md`:
   - Valor para el usuario/negocio (1-5) · Esfuerzo (1-5, con estimación en días) · Riesgo (1-5) · Encaje con el stack actual (1-5) · Costo mensual estimado.
   - Puntaje = valor × encaje ÷ (esfuerzo + riesgo).
   - Cómo se implementaría (fases), qué cambia en el código y la base de datos, dependencias.
   - Alternativas más simples (versión mínima).
   - Veredicto: **hacer ahora / hacer después / versión mínima / descartar**, con el porqué.
   - Fuentes.
5. Actualizar `docs/ideas/README.md` (tabla: fecha · idea · puntaje · veredicto · link). Crearlo si no existe.
6. Responder: veredicto + puntaje + 3 líneas de por qué + "¿la paso a plan?" (si dice que sí → `planner`).
