# Diseño de páginas y UI

Responsable: `designer` (Sonnet). La sesión principal coordina y aprueba.

## Página o app nueva
1. Preguntar solo lo que falte: objetivo de la página, público, marca (colores, logo, tipografía) y referencias.
2. Dirección estética con `frontend-design` + `impeccable` (shape): una idea visual clara, no plantilla genérica.
3. Definir tokens antes de maquetar: color (primario, superficie, texto, estados), tipografía (escala), espaciado (4/8 px), radios, sombras, movimiento (duraciones y curvas).
4. Maquetar mobile-first. Componentes reutilizables.
5. Movimiento con `animate` / `emil-design-eng`: solo donde explica algo (entrada, feedback, cambio de estado). Respetar `prefers-reduced-motion`.
6. Verificar (fase 1 de abajo) antes de entregar.

## Mejorar una página existente (3 fases)

### Fase 1 — Diagnóstico (solo lectura)
- Levantar la app. Capturas con Playwright: 1440 px y 390 px, claro y oscuro.
- `impeccable` audit + critique: jerarquía, tipografía, color, espaciado, layout, accesibilidad, estados vacío/error/carga, textos.
- `npx impeccable detect <url-local>` para reglas que necesitan render (contraste, texto chico).
- `emil-design-eng` + `review-animations`: pulido y movimiento existente.
- `find-animation-opportunities`: dónde falta movimiento.
- `break-ui`: textos largos, listas vacías, números enormes, emoji.
- `mobile-native`: hover pegado, 100vh, zoom en inputs, notch.
- Funcionamiento: errores de consola, flujos rotos, formularios, carga lenta.

### Fase 2 — Plan (esperar aprobación)
Tabla: prioridad (crítico / importante / mejora) · problema · dónde · solución · impacto.
Más la dirección estética propuesta (respetando la identidad actual si la hay).

### Fase 3 — Implementación
- De a una categoría, de crítico a mejora.
- Design tokens, nunca valores sueltos.
- Captura antes/después de cada pantalla tocada.
- `reviewer` al final.

## Desde Figma
Link de Figma → `figma:figma-design-to-code` antes de `get_design_context`. Adaptar a los componentes y tokens del proyecto.

## Reglas fijas
- Contraste AA mínimo. Áreas táctiles ≥ 44 px. Foco visible.
- Nada de fuentes por defecto sin decidirlo (Inter/Roboto solo si es la marca).
- Español rioplatense neutro en los textos de interfaz, salvo que el proyecto diga otra cosa.
