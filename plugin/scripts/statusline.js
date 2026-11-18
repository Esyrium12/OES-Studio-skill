#!/usr/bin/env node
// Statusline OES: modelo · contexto · ventana 5 h · semana · costo de sesión.
'use strict';
const L = require('./lib');
const j = L.readStdin();

const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', c: '\x1b[36m', x: '\x1b[0m' };
const col = (p, lo, hi) => p == null ? C.d : p < lo ? C.g : p < hi ? C.y : C.r;
const num = v => (typeof v === 'number' && isFinite(v)) ? v : null;
const bar = p => { const n = Math.max(0, Math.min(10, Math.round((p || 0) / 10))); return '█'.repeat(n) + '░'.repeat(10 - n); };

const model = (j.model && (j.model.display_name || j.model.id)) || 'Claude';
const cw = j.context_window || {};
let ctxPct = num(cw.used_percentage);
let ctxTok = null, win = num(cw.context_window_size);
if (cw.current_usage) {
  const u = cw.current_usage;
  ctxTok = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
}
if (ctxPct == null && ctxTok != null && win) ctxPct = Math.round(ctxTok / win * 100);
if (ctxPct == null && j.transcript_path) {
  const t = L.contextFromTranscript(j.transcript_path, j.model && j.model.id);
  if (t) { ctxPct = t.pct; ctxTok = t.tokens; win = t.window; }
}
const rl = j.rate_limits || {};
const five = num(rl.five_hour && rl.five_hour.used_percentage);
const week = num(rl.seven_day && rl.seven_day.used_percentage);
const cost = num(j.cost && j.cost.total_cost_usd);

// Guardar estado para el guardián de contexto y el informe de consumo.
try {
  const sid = L.safeId(j.session_id);
  const sp = L.path.join(L.STATE, sid + '.json');
  const prev = L.readJSON(sp, {});
  const now = Date.now();
  const st = Object.assign(prev, { session_id: j.session_id, model, ctx_pct: ctxPct, ctx_tokens: ctxTok, window: win, five_h: five, seven_d: week, cost, cwd: j.workspace && j.workspace.current_dir, ts: now });
  L.writeJSON(sp, st);
  if (!prev.last_log || now - prev.last_log > 60000) {
    L.appendLine(L.path.join(L.OES, 'usage.jsonl'), { ts: now, session_id: j.session_id, model, ctx_pct: ctxPct, five_h: five, seven_d: week, cost, cwd: st.cwd });
    st.last_log = now; L.writeJSON(sp, st);
  }
} catch (_) {}

const parts = [];
parts.push(C.c + model + C.x);
parts.push(col(ctxPct, 60, 80) + 'ctx ' + bar(ctxPct) + ' ' + (ctxPct == null ? '?' : ctxPct + '%') + C.x);
if (five != null) parts.push(col(five, 60, 85) + '5h ' + Math.round(five) + '%' + C.x);
if (week != null) parts.push(col(week, 60, 85) + 'sem ' + Math.round(week) + '%' + C.x);
if (cost != null) parts.push(C.d + '$' + cost.toFixed(2) + C.x);
process.stdout.write(parts.join(C.d + ' │ ' + C.x));
