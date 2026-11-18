#!/usr/bin/env node
// Analizador de contexto estático: qué se carga en cada sesión antes de que escribas nada.
// Uso: node context-audit.js [carpeta-proyecto]
'use strict';
const L = require('./lib');
const { fs, path } = L;
const proj = path.resolve(process.argv[2] || process.cwd());
const tok = s => Math.round((s || '').length / 4);
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; } };
const items = [];
const add = (tipo, nombre, t, nota) => items.push({ tipo, nombre, t, nota: nota || '' });

// CLAUDE.md global y del proyecto (y padres)
add('memoria', '~/.claude/CLAUDE.md', tok(read(path.join(L.CLAUDE_DIR, 'CLAUDE.md'))));
let d = proj;
for (let i = 0; i < 6; i++) {
  for (const f of ['CLAUDE.md', path.join('.claude', 'CLAUDE.md'), 'CLAUDE.local.md']) {
    const p = path.join(d, f); if (fs.existsSync(p)) add('memoria', path.relative(proj, p) || f, tok(read(p)));
  }
  const up = path.dirname(d); if (up === d) break; d = up;
}
// reglas
function walk(dir, fn) { try { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); e.isDirectory() ? walk(p, fn) : fn(p); } } catch (_) {} }
let rules = 0, rulesN = 0; walk(path.join(L.CLAUDE_DIR, 'rules'), p => { if (p.endsWith('.md')) { rules += tok(read(p)); rulesN++; } });
if (rulesN) add('reglas', `~/.claude/rules (${rulesN} archivos)`, rules, 'Las reglas sin "paths:" se cargan siempre');
// descripciones de skills y agentes (solo frontmatter se carga hasta usarlas)
const fm = t => { const m = t.match(/^---[\s\S]*?---/); return m ? m[0] : ''; };
let sk = 0, skN = 0;
const skillDirs = [path.join(L.CLAUDE_DIR, 'skills'), path.join(proj, '.claude', 'skills'), path.join(L.CLAUDE_DIR, 'plugins')];
for (const sd of skillDirs) walk(sd, p => { if (path.basename(p) === 'SKILL.md') { sk += tok(fm(read(p))); skN++; } });
add('skills', `${skN} skills (solo descripción)`, sk, 'Incluye copias en caché de plugins: puede sobreestimar');
let ag = 0, agN = 0; for (const ad of [path.join(L.CLAUDE_DIR, 'agents'), path.join(proj, '.claude', 'agents')]) walk(ad, p => { if (p.endsWith('.md')) { ag += tok(fm(read(p))); agN++; } });
add('agentes', `${agN} subagentes (solo descripción)`, ag);
// MCP
const cj = L.readJSON(path.join(L.os.homedir(), '.claude.json'), {});
const userMcp = Object.keys(cj.mcpServers || {});
const projMcp = Object.keys((L.readJSON(path.join(proj, '.mcp.json'), {}).mcpServers) || {});
const localMcp = Object.keys(((cj.projects || {})[proj] || {}).mcpServers || {});
const allMcp = [...new Set([...userMcp, ...projMcp, ...localMcp])];
add('conectores', `${allMcp.length} MCP propios: ${allMcp.join(', ') || '-'}`, null, 'Más los de plugins. Sus herramientas se cargan bajo demanda (tool search); medí el real con /context');

items.sort((a, b) => (b.t || 0) - (a.t || 0));
console.log(`## Contexto fijo estimado · ${proj}\n`);
console.log('| Tipo | Qué | Tokens aprox. | Nota |\n|---|---|---|---|');
let tot = 0; for (const i of items) { tot += i.t || 0; console.log(`| ${i.tipo} | ${i.nombre} | ${i.t == null ? '-' : i.t.toLocaleString('es-AR')} | ${i.nota} |`); }
console.log(`\nTotal estimado: ~${tot.toLocaleString('es-AR')} tokens (sin contar system prompt ni herramientas).`);
const big = items.filter(i => i.tipo === 'memoria' && i.t > 2000);
if (big.length) console.log(`\nSugerencia: ${big.map(b => b.nombre).join(', ')} supera 2.000 tokens → resumir o usar caveman-compress.`);
console.log('\nMedición real en vivo: escribí /context en Claude Code.');
