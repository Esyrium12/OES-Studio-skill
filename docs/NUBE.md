# OES en Claude Code en la nube

Sirve para usar OES desde la sección **Code** de la app de Claude o desde claude.ai/code. Cada sesión corre en un contenedor Linux nuevo, que se borra al terminar.

## Qué llega solo

Si el plugin `oes` está cargado en claude.ai (plugins de tu cuenta u organización), cada sesión lo trae sincronizado:
- Los comandos `/oes:` y las skills `oes-studio` y `consejo`.
- Los hooks: avisos de contexto y registro de agentes.
- Los 9 agentes `oes:` (desde la 1.3.0).

Los conectores de Supabase, Vercel, Figma y GitHub salen de los conectores de tu cuenta.

**Importante:** la copia de claude.ai no se actualiza sola. Cuando sale una versión nueva en GitHub, actualizala donde cargaste el plugin en claude.ai. Para ver la versión que llegó a una sesión, corré `claude plugin list` y fijate en `oes@synced`.

## Qué agrega el script de entorno

`/oes:setup` no corre en la nube porque no hay PowerShell. En su lugar, el entorno de la nube corre [`plugin/scripts/cloud-setup.sh`](../plugin/scripts/cloud-setup.sh) cada vez que arranca un contenedor nuevo:
- `Explore` en Haiku, reglas de código y el bloque OES en `~/.claude/CLAUDE.md` (con `oes-install.js`).
- Graphify.
- Las 10 skills de diseño de Emil Kowalski.
- El plugin caveman.

Para cargarlo: en la sesión, abrí el menú del entorno en la barra de título, elegí **Edit** y pegá el contenido del script en **Setup script**. Las sesiones nuevas ya lo corren.

## Qué no va en la nube

- **impeccable:** su instalador necesita `impeccable.style`, que la red de la nube no permite por defecto.
- **claude-mem:** la memoria se perdería con cada contenedor.
- **Statusline y panel de agentes:** la app no muestra la statusline, y el panel corre en `localhost`.
- **Firecrawl y ElevenLabs:** necesitan clave. En la nube se cargan como secretos del entorno, nunca en el chat.
