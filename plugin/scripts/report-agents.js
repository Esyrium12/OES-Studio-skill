#!/usr/bin/env node
// Informe del vigilador: qué subagentes se usaron, cuántas veces, tokens y tiempo.
// Uso: node report-agents.js [--dias N] [--sesion ID]
'use strict';
const L = require('./lib');
const a = process.argv.slice(2);
const dias = Number((a[a.indexOf('--dias') + 1]) || 1) || 1;
const ses = a.includes('--sesion') ? a[a.indexOf('--sesion') + 1] : null;
const desde = Date.now() - dias * 86400000;
const ev = L.readJSONL(L.path.join(L.OES, 'agents.jsonl')).filter(e => e.ts >= desde && (!ses || e.session_id === ses));
if (!ev.length) { console.log(`Sin actividad de subagentes en ${ses ? 'esa sesión' : 'los últimos ' + dias + ' día(s)'}.`); process.exit(0); }
const by = {};
for (const e of ev) {
  if (e.ev !== 'start' && e.ev !== 'end') continue;
  const k = e.agent || '?';
  by[k] = by[k] || { lanz: 0, fin: 0, tokens: 0, ms: 0, modelos: new Set() };
  if (e.ev === 'start') { by[k].lanz++; if (e.model) by[k].modelos.add(e.model); }
  else { by[k].fin++; by[k].tokens += e.tokens || 0; by[k].ms += e.ms || 0; }
}
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n);
console.log(`## Subagentes · últimos ${dias} día(s)${ses ? ' · sesión ' + ses : ''}\n`);
console.log('| Agente | Lanzados | Terminados | Tokens | Tokens prom. | Tiempo total | Modelo forzado |');
console.log('|---|---|---|---|---|---|---|');
Object.entries(by).sort((x, y) => y[1].tokens - x[1].tokens).forEach(([k, v]) => {
  console.log(`| ${k} | ${v.lanz} | ${v.fin} | ${fmt(v.tokens)} | ${v.fin ? fmt(Math.round(v.tokens / v.fin)) : '-'} | ${Math.round(v.ms / 1000)} s | ${[...v.modelos].join(', ') || '-'} |`);
});
const abiertos = ev.filter(e => e.ev === 'start' && !ev.some(f => f.ev === 'end' && f.id === e.id));
if (abiertos.length) console.log(`\nSin cerrar (en curso o cortados): ${abiertos.length}`);
console.log('\n### Últimos 10');
ev.filter(e => e.ev === 'start').slice(-10).forEach(e => console.log(`- ${new Date(e.ts).toLocaleString('es-AR')} · ${e.agent} · ${e.desc || ''}`));
