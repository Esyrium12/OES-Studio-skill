# Notas de Obsidian

Responsable: `notes` (Haiku). Comando: `/oes:nota`.

## Reglas
- Español simple y claro.
- Markdown de Obsidian: frontmatter, enlaces `[[así]]`, etiquetas `#tema`, MOCs (notas índice).
- Nunca crear archivos vacíos: cada nota con contenido inicial real.
- Estructura simple que pueda crecer.
- Si hay carpetas de código (`node_modules`, `dist`, `.git`, `venv`) en la bóveda: no tocarlas y avisar para excluirlas en Obsidian → Ajustes → Archivos y enlaces → Archivos excluidos.

## Plantilla de nota
```markdown
---
titulo: <Título>
tipo: nota | moc | proyecto | concepto | guia
tags: [tema1, tema2]
creado: AAAA-MM-DD
fuente: <link o "propio">
---

# <Título>

> Resumen en 1-2 líneas.

## Ideas clave
- ...

## Detalle
...

## Relacionado
- [[MOC - <Área>]]
- [[<Nota relacionada>]]
```

## Plantilla de MOC
```markdown
---
titulo: MOC - <Área>
tipo: moc
tags: [moc, <área>]
creado: AAAA-MM-DD
---

# MOC - <Área>

## Notas
- [[...]] — una línea de qué tiene
```

## Dónde guardar
Si el usuario no dice la bóveda: preguntar la ruta una vez y guardarla en `~/.claude/oes/config.json` (`obsidianVault`).
