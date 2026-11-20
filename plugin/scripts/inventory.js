#!/usr/bin/env node
// Auditoría previa: inventario de plugins, skills, conectores, agentes, hooks y configuración,
// con veredicto (útil / neutro / conviene quitar / duplicado / falta) y lista de lo que falta instalar.
// Uso: node inventory.js [--json] [carpeta-proyecto]
'use strict';
const L = require('./lib');
const { fs, path } = L;
const { execSync } = require('child_process');
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const proj = path.resolve(args.find(a => !a.startsWith('--')) || process.cwd());
const C = L.CLAUDE_DIR;
const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return []; } };
const has = cmd => { try { execSync((process.platform === 'win32' ? 'where ' : 'command -v ') + cmd, { stdio: 'ignore' }); return true; } catch (_) { return false; } };
const ver = cmd => { try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split(/\r?\n/)[0]; } catch (_) { return null; } };

// ---------- Lo que OES quiere ----------
const WANT = {
  plugins: {
    'caveman@caveman': 'Respuestas cortas (modo cavernícola)',
    'claude-mem@thedotmack': 'Memoria entre sesiones',
    'claude-code-setup@claude-plugins-official': 'Recomendaciones de configuración',
    'frontend-design@claude-plugins-official': 'Dirección estética de UI',
    'figma@claude-plugins-official': 'Figma ↔ código',
    'playwright@claude-plugins-official': 'Navegador: capturas y E2E',
    'oes@oes-studio': 'Este sistema'
  },
  skills: ['emil-design-eng', 'animate', 'review-animations', 'improve-animations', 'find-animation-opportunities', 'apple-design', 'mobile-native', 'break-ui', 'animation-vocabulary', 'pick-ui-library', 'impeccable'],
  skillsSupabase: 'supabase',
  cli: { node: 'node --version', git: 'git --version', uv: 'uv --version', gh: 'gh --version', bun: 'bun --version', graphify: 'graphify --version' }
};
// ---------- Conocimiento: qué conviene quitar o duplica ----------
const QUITAR = {
  'omniroute': 'Gateway de terceros: bug conocido con edición de archivos y riesgo de políticas',
  'mempalace': 'Duplica a claude-mem (usar una sola memoria)',
  'remove-ai-marks': 'No aplica a tu trabajo',
  'write-swift': 'Solo iOS/Swift', 'animate-expo': 'Solo React Native/Expo', 'ask-sonner': 'Solo la librería Sonner',
  'everything-claude-code': 'ECC completo: decenas de hooks y agentes que se pisan con OES (OES ya trae sus reglas)',
  'ecc': 'ECC completo: decenas de hooks y agentes que se pisan con OES (OES ya trae sus reglas)'
};
const SIN_USO_OES = ['prototype'];

const out = { proyecto: proj, avisos: [], items: [], faltan: { plugins: [], skills: [], cli: [] } };
const push = (tipo, nombre, estado, veredicto, motivo, accion) => out.items.push({ tipo, nombre, estado, veredicto, motivo, accion });
const lower = s => String(s).toLowerCase();
const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const quitarMotivo = n => { const k = Object.keys(QUITAR).find(q => new RegExp('(^|[^a-z0-9])' + esc(q) + '([^a-z0-9]|$)').test(lower(n))); return k ? QUITAR[k] : null; };
const CONOCIDOS = ['impeccable', 'caveman', 'claude-mem', 'graphify', 'oes'];
const esConocido = n => CONOCIDOS.find(c => lower(n).includes(c));

// ---------- Plugins ----------
const inst = L.readJSON(path.join(C, 'plugins', 'installed_plugins.json'), {});
const instPlugins = Object.keys(inst.plugins || inst || {}).filter(k => k.includes('@'));
const settings = L.readJSON(path.join(C, 'settings.json'), {});
const enabled = settings.enabledPlugins || {};
const allPlugins = [...new Set([...instPlugins, ...Object.keys(enabled)])];
for (const p of allPlugins) {
  const on = enabled[p] !== false;
  const q = quitarMotivo(p.split('@')[0]);
  if (WANT.plugins[p]) push('plugin', p, on ? 'activo' : 'desactivado', 'útil', WANT.plugins[p], on ? 'dejar' : 'activar');
  else if (q) push('plugin', p, on ? 'activo' : 'desactivado', 'conviene quitar', q, 'desinstalar');
  else push('plugin', p, on ? 'activo' : 'desactivado', 'neutro', 'No es parte de OES; no choca', 'decidir');
}
for (const p of Object.keys(WANT.plugins)) if (!allPlugins.includes(p) && p !== 'oes@oes-studio') { out.faltan.plugins.push(p); push('plugin', p, 'no instalado', 'falta', WANT.plugins[p], 'instalar'); }

// ---------- Skills (usuario y proyecto) ----------
const skillLoc = {};
const userSkills = path.join(C, 'skills'), projSkills = path.join(proj, '.claude', 'skills');
const skillScopes = [['usuario', userSkills]];
// Abierto en la carpeta de usuario (o .claude/skills enlazada a la de usuario): es la misma carpeta, no un duplicado.
if (!L.samePath(projSkills, userSkills)) skillScopes.push(['proyecto', projSkills]);
else out.avisos.push(L.samePath(proj, L.os.homedir())
  ? 'Auditoría corrida desde la carpeta de usuario: se omitió el chequeo de skills de proyecto (.claude/skills es la misma que la de usuario).'
  : 'La carpeta .claude/skills del proyecto es la misma que la de usuario: se omitió el chequeo de skills de proyecto.');
for (const [scope, dir] of skillScopes) {
  for (const e of ls(dir)) if (e.isDirectory() || e.isSymbolicLink()) (skillLoc[e.name] = skillLoc[e.name] || []).push(scope);
}
// skills que vienen dentro de plugins instalados
const pluginSkills = {};
const pc = path.join(C, 'plugins', 'cache');
for (const m of ls(pc)) for (const pl of ls(path.join(pc, m.name))) for (const v of ls(path.join(pc, m.name, pl.name))) {
  for (const s of ls(path.join(pc, m.name, pl.name, v.name, 'skills'))) (pluginSkills[s.name] = pluginSkills[s.name] || new Set()).add(pl.name);
}
for (const [name, where] of Object.entries(skillLoc)) {
  const enPlugin = pluginSkills[name] ? [...pluginSkills[name]] : [];
  const q = quitarMotivo(name);
  if (where.length > 1 || enPlugin.length) push('skill', name, where.join(' + ') + (enPlugin.length ? ' + plugin ' + enPlugin.join(',') : ''), 'duplicado', 'Misma skill en más de un lugar: se activa dos veces o se pisa', 'dejar una sola copia');
  else if (q) push('skill', name, where[0], 'conviene quitar', q, 'quitar');
  else if (['frontend-design', 'figma-use', 'playwright', 'caveman'].includes(name)) push('skill', name, where[0], 'duplicado', 'OES lo instala como plugin: quedarían dos copias', 'quitar la skill suelta o excluir el plugin');
  else if (WANT.skills.includes(name) || name.startsWith('supabase') || name.startsWith('graphify') || name.startsWith('impeccable')) push('skill', name, where[0], 'útil', 'Parte del flujo OES', 'dejar');
  else if (SIN_USO_OES.includes(name)) push('skill', name, where[0], 'neutro', 'Útil solo para prototipos rápidos', 'decidir');
  else push('skill', name, where[0], 'neutro', 'No es parte de OES; solo ocupa su descripción en contexto', 'decidir');
}
const tieneImpeccable = Object.keys(skillLoc).some(n => n.startsWith('impeccable')) || Object.keys(pluginSkills).some(n => n.startsWith('impeccable'));
for (const s of WANT.skills) {
  const ok = s === 'impeccable' ? tieneImpeccable : (skillLoc[s] || pluginSkills[s]);
  if (!ok) { out.faltan.skills.push(s); push('skill', s, 'no instalada', 'falta', 'Parte del flujo de diseño OES', 'instalar'); }
}
if (!Object.keys(skillLoc).some(n => n.startsWith('supabase'))) { out.faltan.skills.push('supabase'); push('skill', 'supabase agent-skills', 'no instalada', 'falta', 'Buenas prácticas y seguridad de Supabase', 'instalar'); }

// ---------- Conectores MCP ----------
const cj = L.readJSON(path.join(L.os.homedir(), '.claude.json'), {});
const mcps = [];
for (const [n, c] of Object.entries(cj.mcpServers || {})) mcps.push({ n, c, scope: 'usuario' });
for (const [n, c] of Object.entries(((cj.projects || {})[proj] || {}).mcpServers || {})) mcps.push({ n, c, scope: 'local' });
for (const [n, c] of Object.entries((L.readJSON(path.join(proj, '.mcp.json'), {}).mcpServers) || {})) mcps.push({ n, c, scope: 'proyecto' });
const OES_MCP = { context7: 'mcp.context7.com', supabase: 'mcp.supabase.com', vercel: 'mcp.vercel.com', playwright: '@playwright/mcp' };
const sig = c => lower((c.url || '') + ' ' + (c.command || '') + ' ' + (c.args || []).join(' '));
const seen = {};
for (const m of mcps) {
  const s = sig(m.c);
  const dupOes = Object.entries(OES_MCP).find(([k, v]) => s.includes(v) || lower(m.n) === k);
  const q = quitarMotivo(m.n + ' ' + s);
  const key = s.replace(/\s+/g, ' ').trim();
  if (seen[key]) push('conector', m.n, m.scope, 'duplicado', `Mismo servidor que "${seen[key]}"`, 'quitar uno');
  else if (dupOes) push('conector', m.n, m.scope, 'duplicado', `OES ya trae ${dupOes[0]} (plugin)`, `claude mcp remove ${m.n} -s ${m.scope === 'usuario' ? 'user' : m.scope}`);
  else if (lower(m.n).includes('github')) push('conector', m.n, m.scope, 'neutro', 'OES usa gh CLI (menos contexto). Dejarlo no rompe nada', 'decidir');
  else if (q) push('conector', m.n, m.scope, 'conviene quitar', q, 'quitar');
  else if (lower(m.n).includes('firecrawl')) push('conector', m.n, m.scope, 'útil', 'Lectura de webs y kit de marca', 'dejar');
  else push('conector', m.n, m.scope, 'neutro', 'No es parte de OES', 'decidir');
  seen[key] = seen[key] || m.n;
}

// ---------- Agentes ----------
const OES_AG = ['Explore', 'planner', 'implementer', 'reviewer', 'designer', 'tester', 'notes', 'consejero', 'revisor-consejo', 'presidente'];
for (const e of ls(path.join(C, 'agents'))) {
  if (!e.name.endsWith('.md')) continue;
  const n = e.name.replace(/\.md$/, '');
  const t = (() => { try { return fs.readFileSync(path.join(C, 'agents', e.name), 'utf8'); } catch (_) { return ''; } })();
  const esOes = t.includes('equipo OES') || t.includes('Consejo OES');
  if (!OES_AG.includes(n) && esConocido(n)) { push('agente', n, 'usuario', 'útil', `Viene con ${esConocido(n)}`, 'dejar'); continue; }
  if (OES_AG.includes(n)) push('agente', n, 'usuario', esOes ? 'útil' : 'duplicado', esOes ? 'Agente OES' : 'Mismo nombre que un agente OES: se reemplazará (con copia .bak)', esOes ? 'dejar' : 'reemplazar');
  else push('agente', n, 'usuario', 'neutro', 'Agente propio no OES', 'decidir');
}

// ---------- Hooks, statusline, memoria ----------
const hooks = settings.hooks || {};
const hookSeen = {};
for (const [evn, arr] of Object.entries(hooks)) for (const h of arr || []) for (const x of (h.hooks || [])) {
  const cmd = x.command || '';
  const q = quitarMotivo(cmd);
  const kk = evn + '|' + cmd;
  if (hookSeen[kk]) { push('hook', evn, cmd.slice(0, 70), 'duplicado', 'El mismo hook está dos veces: se ejecuta doble', 'quitar uno'); continue; }
  hookSeen[kk] = 1;
  if (esConocido(cmd)) { push('hook', `${evn}${h.matcher ? ' [' + h.matcher + ']' : ''}`, cmd.slice(0, 70), 'útil', `Hook de ${esConocido(cmd)}`, 'dejar'); continue; }
  push('hook', `${evn}${h.matcher ? ' [' + h.matcher + ']' : ''}`, cmd.slice(0, 70), q ? 'conviene quitar' : 'neutro', q || 'Hook propio en settings.json; revisar que no repita uno de OES', 'decidir');
}
if (settings.statusLine) {
  const c = settings.statusLine.command || '';
  push('statusline', 'statusLine', c.slice(0, 70), c.includes('oes') ? 'útil' : 'duplicado', c.includes('oes') ? 'Statusline OES' : 'Hay otra statusline: OES la reemplaza (con copia)', c.includes('oes') ? 'dejar' : 'reemplazar');
}
if (settings.env && settings.env.CLAUDE_CODE_SUBAGENT_MODEL) push('config', 'CLAUDE_CODE_SUBAGENT_MODEL', settings.env.CLAUDE_CODE_SUBAGENT_MODEL, 'conviene quitar', 'Pisa el modelo de cada agente', 'quitar de settings.json → env');
const gm = path.join(C, 'CLAUDE.md');
if (fs.existsSync(gm)) {
  const t = fs.readFileSync(gm, 'utf8'); const tk = Math.round(t.length / 4);
  push('memoria', '~/.claude/CLAUDE.md', `~${tk} tokens`, tk > 2500 ? 'conviene quitar' : 'útil', tk > 2500 ? 'Muy largo: se carga en cada sesión' : (t.includes('OES:START') ? 'Ya tiene el bloque OES' : 'Se le agrega el bloque OES sin borrar lo tuyo'), tk > 2500 ? 'resumir' : 'dejar');
}

// ---------- Herramientas de terminal ----------
for (const [k, c] of Object.entries(WANT.cli)) {
  const v = has(k) ? ver(c) : null;
  if (v) push('cli', k, v, 'útil', 'Requisito OES', 'dejar');
  else { out.faltan.cli.push(k); push('cli', k, 'no encontrado', 'falta', 'Requisito OES', 'instalar'); }
}

if (asJson) { process.stdout.write(JSON.stringify(out, null, 2)); process.exit(0); }
L.writeJSON(path.join(L.OES, 'audit.json'), out);
const orden = { 'conviene quitar': 0, 'duplicado': 1, 'falta': 2, 'neutro': 3, 'útil': 4 };
console.log(`## Auditoría OES · ${new Date().toLocaleString('es-AR')}\n`);
for (const a of out.avisos) console.log(`> ${a}\n`);
console.log('| Veredicto | Tipo | Elemento | Estado | Motivo | Acción sugerida |\n|---|---|---|---|---|---|');
out.items.sort((a, b) => orden[a.veredicto] - orden[b.veredicto]).forEach(i => console.log(`| ${i.veredicto} | ${i.tipo} | ${i.nombre} | ${i.estado} | ${i.motivo} | ${i.accion} |`));
const cnt = v => out.items.filter(i => i.veredicto === v).length;
console.log(`\nResumen: ${cnt('útil')} útiles · ${cnt('neutro')} neutros · ${cnt('duplicado')} duplicados · ${cnt('conviene quitar')} para quitar · ${cnt('falta')} faltan.`);
