---
description: Medio para redes - estrategia, estilo y un equipo autónomo que busca tendencias, crea videos con tu estilo y los publica
argument-hint: "configurar | ciclo | estado | aprobar"
---
Acción: $ARGUMENTS (si está vacío: `estado` si existe `social/`, si no `configurar`).
Ruta del plugin: `${CLAUDE_PLUGIN_ROOT}` (si no se expande, `~/.claude/oes/plugin-root.txt`). Plantillas en `<ruta>/templates/social/`.

## configurar
1. Preguntar con AskUserQuestion (lo que falte): marca o proyecto (OES, Nodelier, Aether…), redes, objetivo (ventas, seguidores, autoridad), público, tono, frecuencia, idioma, colores/logo y 2-3 cuentas de referencia que le gusten.
2. Crear en la carpeta actual: `social/estilo.md` (completo con las respuestas), `social/config.json`, `social/{tendencias,guiones,cola,publicados,assets,plantillas}/` con un README de una línea cada una, `social/registro.md`.
3. Copiar los 4 agentes de `templates/social/agents/` a `.claude/agents/` del proyecto (trend-scout, guionista, productor, publicador).
4. Herramientas (auditar primero, no duplicar): ffmpeg (`winget install Gyan.FFmpeg`), Remotion en `social/plantillas/` (`npx create-video@latest`, plantilla vertical con subtítulos y colores de marca), ElevenLabs para voz (el usuario define `ELEVENLABS_API_KEY`; opcional: conector MCP de ElevenLabs).
5. Publicación — explicar opciones y que el usuario elija por red:
   - Oficial y gratis: YouTube Data API (Shorts), Instagram/Facebook Graph API (cuenta profesional + app de Meta), TikTok Content Posting API (requiere aprobar la app; sin aprobación publica solo en privado).
   - Servicio de programación con API (ej. Ayrshare): una sola integración para todas, de pago.
   El usuario crea las cuentas/apps y carga las claves en variables de entorno de Windows. Claude nunca las pide en el chat.
6. Ciclo automático: crear tarea programada de Windows (Programador de tareas) que corra a la hora de `horaCiclo`:
   `claude -p "/oes:social ciclo" --permission-mode acceptEdits` con la carpeta del proyecto como directorio de inicio. Mostrar el comando `schtasks` y crearlo solo con su OK.
7. Primer ciclo de prueba en modo `aprobacion`.

## ciclo
1. `trend-scout` → 5 ideas. 2. Elegir las N del día según `frecuencia`, sin repetir temas de los últimos 14 días (`registro.md`). 3. `guionista` → guiones. 4. `productor` → videos en `cola/`. 5. `publicador` → publica según el modo de cada red. 6. Resumen de 5 líneas en `social/registro.md`.

## aprobar
Listar `social/cola/` (título, red, duración, ruta del video) y preguntar cuáles aprobar; marcar `aprobado: true`. Ofrecer pasar una red a modo `autonomo` solo si el usuario lo pide.

## estado
Tabla: publicados (últimos 14 días, con link) · en cola · errores · próximas tendencias. Si hay métricas por API, mostrar vistas y qué formato rindió mejor y ajustar `estilo.md` solo con OK del usuario.

Reglas fijas: nada de contenido ajeno ni re-subidas; etiquetar IA realista; respetar `maxPorDia`; sin spam ni interacciones automáticas (likes, comentarios, follows) — solo publicar contenido propio.
