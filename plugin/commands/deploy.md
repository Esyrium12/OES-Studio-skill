---
description: Verifica y despliega en Vercel - preview automático, producción solo con confirmación
argument-hint: "[preview | produccion]"
---
Destino: $ARGUMENTS (por defecto preview).
1. Verificar: build local, tests, `reviewer` rápido sobre lo no desplegado, variables de entorno requeridas presentes en Vercel (sin mostrar valores).
2. Supabase: si hay migraciones pendientes, listarlas; aplicarlas en producción solo con confirmación explícita.
3. Preview: desplegar (CLI de Vercel o push a la rama) y dar la URL.
4. Producción: mostrar qué se va a publicar (commits, migraciones) y **esperar un sí explícito**. Después del deploy: revisar errores de runtime de los primeros minutos con el conector de Vercel.
5. Responder: URL, estado y cómo volver atrás (rollback) si algo falla.
