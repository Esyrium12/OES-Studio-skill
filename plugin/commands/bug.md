---
description: Encuentra y arregla un error - reproducir, causa raíz, test y arreglo mínimo
argument-hint: "<qué falla / mensaje de error>"
---
Error: $ARGUMENTS
1. Reproducir (comando, test o pasos). Si no se puede, pedir el dato que falta.
2. `Explore` ubica el código involucrado; la sesión principal (Opus) busca la causa raíz, no el síntoma.
3. Test que falle por el bug (si es posible).
4. `implementer` aplica el arreglo mínimo; `tester` confirma que el test pasa y no se rompió nada más.
5. Responder: causa · arreglo · archivos · cómo se verificó. Si el bug revela un problema mayor, anotarlo en `docs/estado.md`.
