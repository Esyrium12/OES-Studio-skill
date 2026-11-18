#!/usr/bin/env node
// Hook UserPromptSubmit: avisa a Claude cuando el contexto pasa 70 % y 85 %.
'use strict';
const L = require('./lib');
const j = L.readStdin();
try {
  const sp = L.path.join(L.STATE, L.safeId(j.session_id) + '.json');
  const st = L.readJSON(sp, {});
  let pct = st.ctx_pct;
  if ((pct == null || Date.now() - (st.ts || 0) > 120000) && j.transcript_path) {
    const t = L.contextFromTranscript(j.transcript_path);
    if (t) pct = t.pct;
  }
  // Límites de uso (ventana 5 h y semana): sugerir /oes:limite una sola vez por nivel
  const lim = [];
  if (st.five_h != null && st.five_h < 50 && st.warn5) { st.warn5 = 0; L.writeJSON(sp, st); }
  if (st.seven_d != null && st.seven_d < 50 && st.warn7) { st.warn7 = 0; L.writeJSON(sp, st); }
  if (st.five_h != null && st.five_h >= 90 && !(st.warn5 >= 90)) { lim.push(`ventana de 5 h al ${Math.round(st.five_h)}%`); st.warn5 = 90; }
  if (st.seven_d != null && st.seven_d >= 95 && !(st.warn7 >= 95)) { lim.push(`límite semanal al ${Math.round(st.seven_d)}%`); st.warn7 = 95; }
  if (lim.length) {
    L.writeJSON(sp, st);
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: `[OES] Uso: ${lim.join(' y ')}. Avisale al usuario en una línea y proponé /oes:limite para cortar en un buen punto y dejar el traspaso guardado.` } }));
    process.exit(0);
  }
  if (pct == null) process.exit(0);
  const warned = st.warned || 0;
  let msg = null, level = warned;
  if (pct < 50 && warned) level = 0; // se compactó: reiniciar avisos
  if (pct >= 85 && warned < 85) {
    level = 85;
    msg = `[OES] Contexto al ${pct}%. Antes de seguir: terminá la acción en curso, guardá el estado en docs/estado.md y proponé /compact con foco en la tarea actual (o delegá el resto a subagentes). Avisale al usuario en una línea.`;
  } else if (pct >= 70 && warned < 70) {
    level = 70;
    msg = `[OES] Contexto al ${pct}%. Delegá lecturas a Explore y, al terminar la fase actual, sugerí /compact. Avisale al usuario en una línea.`;
  }
  if (level !== warned) { st.warned = level; L.writeJSON(sp, st); }
  if (msg) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: msg } }));
} catch (_) {}
process.exit(0);
