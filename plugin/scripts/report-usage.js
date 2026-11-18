#!/usr/bin/env node
// Informe de consumo desde los datos que guarda la statusline OES.
// Uso: node report-usage.js [--dias N]
'use strict';
const L = require('./lib');
const a = process.argv.slice(2);
const dias = Number((a[a.indexOf('--dias') + 1]) || 7) || 7;
const desde = Date.now() - dias * 86400000;
const rows = L.readJSONL(L.path.join(L.OES, 'usage.jsonl')).filter(r => r.ts >= desde);
if (!rows.length) { console.log('Sin datos todavía (la statusline OES los va guardando mientras usás Claude Code).'); process.exit(0); }
const last = rows[rows.length - 1];
console.log('## Ahora');
console.log(`- Ventana 5 h: ${last.five_h != null ? Math.round(last.five_h) + '%' : 's/d'} · Semana: ${last.seven_d != null ? Math.round(last.seven_d) + '%' : 's/d'} · Contexto última sesión: ${last.ctx_pct != null ? last.ctx_pct + '%' : 's/d'}`);
// costo por sesión = máximo visto; agrupado por día y modelo
const ses = {};
for (const r of rows) {
  const s = ses[r.session_id] = ses[r.session_id] || { cost: 0, day: '', model: r.model, cwd: r.cwd, maxctx: 0 };
  s.cost = Math.max(s.cost, r.cost || 0); s.day = new Date(r.ts).toISOString().slice(0, 10); s.model = r.model || s.model; s.maxctx = Math.max(s.maxctx, r.ctx_pct || 0);
}
const dia = {}, mod = {}, proy = {};
for (const s of Object.values(ses)) {
  dia[s.day] = (dia[s.day] || 0) + s.cost;
  mod[s.model] = (mod[s.model] || 0) + s.cost;
  const p = (s.cwd || '?').split(/[\\/]/).filter(Boolean).pop();
  proy[p] = (proy[p] || 0) + s.cost;
}
const t = (title, o) => { console.log(`\n## ${title}`); console.log('| | Costo equivalente (USD) |\n|---|---|'); Object.entries(o).sort((x, y) => y[1] - x[1]).forEach(([k, v]) => console.log(`| ${k} | $${v.toFixed(2)} |`)); };
t(`Por día (últimos ${dias})`, dia); t('Por modelo de la sesión principal', mod); t('Por proyecto', proy);
const altas = Object.values(ses).filter(s => s.maxctx >= 85).length;
console.log(`\nSesiones: ${Object.keys(ses).length} · llegaron a ≥85 % de contexto: ${altas}`);
console.log('\nNota: con suscripción Pro/Max el costo es "equivalente API" (sirve para comparar, no es lo que pagás).');
