---
description: Analiza todo el proyecto buscando errores, qué mejorar, qué perfeccionar y qué quitar
---
Análisis completo del proyecto de la carpeta actual. Solo lectura: no cambiar código.

1. Lanzar en paralelo (un mensaje, varios subagentes):
   - `Explore`: mapa del proyecto, código muerto, duplicado, archivos gigantes, dependencias sin uso (usar Graphify si está).
   - `reviewer`: bugs, seguridad (secretos, inyección, auth), Supabase (RLS, políticas, claves).
   - `tester`: build, typecheck, lint, tests; cobertura de flujos críticos.
   - `designer` (si hay UI): `npx impeccable detect` + revisión rápida de accesibilidad y responsive.
   - Rendimiento: tamaño del bundle, imágenes, consultas N+1, índices.
   - Dependencias: `npm audit` (o equivalente), paquetes desactualizados o abandonados.
   - Si hay Supabase/Vercel conectados: advisors de Supabase y errores de runtime de Vercel.
2. Unificar en `docs/analisis/AAAA-MM-DD.md`:
   | Prioridad | Categoría | Dónde | Problema | Arreglo | Esfuerzo |
   Categorías: error · mejorar · perfeccionar · quitar. Prioridad: crítico / importante / menor.
3. Mostrar: resumen (cantidad por prioridad), los 5 más importantes y "¿armo el plan para arreglar los críticos?".
