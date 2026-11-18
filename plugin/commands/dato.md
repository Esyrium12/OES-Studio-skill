---
description: Guarda un dato o información del proyecto (o general) donde corresponde
argument-hint: "<dato>"
---
Dato: $ARGUMENTS

1. Si no hay dato en el argumento, pedirlo en una línea.
2. Clasificar: regla o convención del proyecto · dato técnico (credencial NO: nunca guardar secretos, solo el nombre de la variable de entorno) · dato de negocio (precios, clientes, proveedores, plazos) · contacto · referencia (link, doc).
3. Dónde va:
   - Dentro de un proyecto → `docs/datos.md`, en la sección de su categoría, con fecha y fuente. Si es una regla que Claude debe seguir siempre → además una línea en el `CLAUDE.md` del proyecto (que siga corto).
   - Fuera de un proyecto → nota de Obsidian con `notes`.
4. Si contradice algo ya guardado: mostrar ambos y preguntar cuál vale; marcar el viejo como "(reemplazado AAAA-MM-DD)".
5. Si `docs/datos.md` no existe, crearlo con encabezado y secciones con el dato ya dentro (nunca vacío).
6. Responder en una línea: dónde quedó.
