---
description: Consejo de 5 asesores - analizan, se revisan en forma anónima y un presidente da el veredicto
argument-hint: "[rapido|normal|profundo] <pregunta o decisión>"
---
Ejecutar la skill `consejo` con: $ARGUMENTS

- Si la primera palabra es `rapido`, `normal` o `profundo`, ese es el modo; si no, `normal`.
- Si no hay pregunta, pedirla en una línea.
- Si es una pregunta de una sola respuesta, decirlo en una línea y responder directo, sin consejo.
- Seguir los pasos 1-6 de la skill (pregunta enmarcada → asesores en paralelo → revisión anónima → presidente → veredicto en el chat → guardar en `docs/consejo/`).
