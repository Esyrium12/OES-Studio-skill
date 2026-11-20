#!/bin/bash
# OES-Studio en Claude Code en la nube (claude.ai/code o sección Code de la app).
# Se usa como "setup script" del entorno: corre como root en cada contenedor nuevo, antes de que arranque Claude.
# El plugin oes llega sincronizado desde claude.ai; esto agrega lo que en Windows hace /oes:setup.
# Nunca falla: si un paso no anda, sigue con el resto.
# impeccable no va: su instalador necesita impeccable.style, que la red de la nube no permite por defecto.
OES=/opt/oes-studio
rm -rf "$OES"
git clone -q --depth 1 https://github.com/Esyrium12/OES-Studio-skill "$OES" || exit 0
# Graphify antes que oes-install: "graphify install" reescribe ~/.claude/CLAUDE.md
uv tool install -q graphifyy && /root/.local/bin/graphify install >/dev/null || true
node "$OES/plugin/scripts/oes-install.js" --no-statusline || true
npx -y skills@latest add emilkowalski/skills -g -a claude-code -y \
  -s emil-design-eng -s animate -s review-animations -s improve-animations -s find-animation-opportunities \
  -s apple-design -s mobile-native -s break-ui -s animation-vocabulary -s pick-ui-library >/dev/null || true
claude plugin marketplace add JuliusBrussee/caveman >/dev/null && claude plugin install caveman@caveman >/dev/null || true
exit 0
