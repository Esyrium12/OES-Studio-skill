# Reglas de código OES
Destiladas de las reglas comunes de ECC (MIT, Affaan Mustafa). Originales completas en el plugin: `ecc-reference/rules-common/` (leer solo si hace falta detalle).

## Seguridad (antes de cada commit)
- Sin secretos en código: variables de entorno; validar que existan al arrancar.
- Validar toda entrada del usuario. Consultas parametrizadas. HTML sanitizado (XSS).
- Auth y permisos verificados en el servidor, no solo en la UI. Rate limiting en endpoints públicos.
- Errores sin filtrar datos sensibles. Si un secreto se expuso: rotarlo.

## Estilo
- Inmutabilidad por defecto: crear objetos nuevos en vez de mutar.
- Funciones chicas (≈ < 50 líneas), archivos enfocados (≈ < 400 líneas), nombres que digan qué hacen.
- Manejar errores explícitamente; nada de `catch` vacío.
- Sin código muerto ni `console.log` de depuración en lo entregado.

## Tests
- Flujos críticos con test (auth, pagos, datos). Un bug arreglado → test que lo cubra.
- Escribir el test que falla antes de arreglar, cuando el bug es reproducible.

## Git
- Commits chicos con mensaje convencional: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Nunca push forzado a main. Ramas para cambios grandes.

## Rendimiento
- Evitar N+1, paginar listas, índices en columnas filtradas.
- Imágenes optimizadas y con tamaño; carga diferida de lo pesado.
