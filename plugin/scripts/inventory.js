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

const out = { proyecto: proj, items: [], faltan: { plugins: [], skills: [], cli: [] } };
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

// ---------- Plugins cargados (sincronizados desde claude.ai e instalados) con su carpeta ----------
// Sirve para ver qué conectores y skills traen. Id: nombre@synced o nombre@marketplace.
const enabledEf = { ...enabled, ...(L.readJSON(path.join(proj, '.claude', 'settings.json'), {}).enabledPlugins || {}), ...(L.readJSON(path.join(proj, '.claude', 'settings.local.json'), {}).enabledPlugins || {}) };
const esDir = d => { try { return fs.statSync(d).isDirectory(); } catch (_) { return false; } };
const mtime = d => { try { return fs.statSync(d).mtimeMs; } catch (_) { return 0; } };
const mismaRuta = (a, b) => { const x = path.resolve(a), y = path.resolve(b); return process.platform === 'win32' ? lower(x) === lower(y) : x === y; };
const cargados = [];
const cargar = (root, id, nombre, manifest) => { if (enabledEf[id] !== false && !cargados.some(p => p.id === id)) cargados.push({ id, nombre, root, manifest }); };
const sy = path.join(C, 'plugins', 'synced');
for (const org of ls(sy)) if (!org.name.startsWith('.')) for (const d of ls(path.join(sy, org.name))) {
  const root = path.join(sy, org.name, d.name);
  if (d.name.startsWith('.') || !esDir(root)) continue;
  const mf = L.readJSON(path.join(root, '.claude-plugin', 'plugin.json'), {});
  cargar(root, `${mf.name || d.name}@synced`, mf.name || d.name, mf);
}
const pc = path.join(C, 'plugins', 'cache');
const hayRegistro = fs.existsSync(path.join(C, 'plugins', 'installed_plugins.json'));
const instInfo = inst.plugins || inst || {};
for (const m of ls(pc)) for (const pl of ls(path.join(pc, m.name))) {
  const id = `${pl.name}@${m.name}`, base = path.join(pc, m.name, pl.name);
  const reg = [].concat(instInfo[id] || []).filter(e => e && typeof e === 'object');
  const aplica = reg.filter(e => !e.projectPath || mismaRuta(e.projectPath, proj));
  if (reg.length ? !aplica.length : hayRegistro) continue; // instalado solo en otro proyecto, o restos viejos en la caché
  const root = aplica.map(e => e.installPath).find(p => p && esDir(p))
    || ls(base).map(v => path.join(base, v.name)).filter(v => esDir(v) && !fs.existsSync(path.join(v, '.orphaned_at'))).sort((a, b) => mtime(b) - mtime(a))[0];
  if (!root) continue;
  const mf = L.readJSON(path.join(root, '.claude-plugin', 'plugin.json'), {});
  cargar(root, id, mf.name || pl.name, mf);
}

// ---------- Skills (usuario y proyecto) ----------
const skillLoc = {};
for (const [scope, dir] of [['usuario', path.join(C, 'skills')], ['proyecto', path.join(proj, '.claude', 'skills')]]) {
  for (const e of ls(dir)) if (e.isDirectory() || e.isSymbolicLink()) (skillLoc[e.name] = skillLoc[e.name] || []).push(scope);
}
// skills que vienen dentro de plugins instalados
const pluginSkills = {};
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
// El plugin oficial de Supabase ya trae sus skills: instalar agent-skills aparte las duplicaría.
if (!cargados.some(p => p.nombre === 'supabase') && !Object.keys(skillLoc).some(n => n.startsWith('supabase'))) { out.faltan.skills.push('supabase'); push('skill', 'supabase agent-skills', 'no instalada', 'falta', 'Buenas prácticas y seguridad de Supabase', 'instalar'); }

// ---------- Conectores MCP ----------
const cj = L.readJSON(path.join(L.os.homedir(), '.claude.json'), {});
const mcps = [];
for (const [n, c] of Object.entries(cj.mcpServers || {})) mcps.push({ n, c, scope: 'usuario' });
for (const [n, c] of Object.entries(((cj.projects || {})[proj] || {}).mcpServers || {})) mcps.push({ n, c, scope: 'local' });
for (const [n, c] of Object.entries((L.readJSON(path.join(proj, '.mcp.json'), {}).mcpServers) || {})) mcps.push({ n, c, scope: 'proyecto' });
const OES_MCP = { context7: 'mcp.context7.com', supabase: 'mcp.supabase.com', vercel: 'mcp.vercel.com', playwright: '@playwright/mcp' };
const sig = c => lower((c.url || '') + ' ' + (c.command || '') + ' ' + (c.args || []).join(' '));
const clave = c => sig(c).replace(/\s+/g, ' ').trim();
const scopeCli = { usuario: 'user', local: 'local', proyecto: 'project' };

// Conectores de los plugins cargados, leídos como Claude Code: .mcp.json en la raíz + "mcpServers" de plugin.json
// (ruta, objeto o lista). El archivo puede ser {mcpServers:{...}} o el mapa directo. Nombre: plugin:<plugin>:<servidor>.
const mcpDeArchivo = f => { const j = L.readJSON(f, null); return j && typeof j === 'object' ? (j.mcpServers || j) : {}; };
const conRaiz = (c, root) => { try { return JSON.parse(JSON.stringify(c).split('${CLAUDE_PLUGIN_ROOT}').join(JSON.stringify(root).slice(1, -1))); } catch (_) { return c; } };
const apagados = ((cj.projects || {})[proj] || {}).disabledMcpServers || []; // los que el usuario apagó con /mcp disable
const pmcps = [];
for (const p of cargados) {
  let srv = { ...mcpDeArchivo(path.join(p.root, '.mcp.json')) };
  for (const spec of [].concat(p.manifest.mcpServers || [])) {
    if (typeof spec === 'string') { if (!/\.mcpb$/i.test(spec)) srv = { ...srv, ...mcpDeArchivo(path.resolve(p.root, spec)) }; }
    else if (spec && typeof spec === 'object') srv = { ...srv, ...spec };
  }
  for (const [n, c] of Object.entries(srv)) {
    const full = `plugin:${p.nombre}:${n}`;
    if (c && typeof c === 'object' && !Array.isArray(c) && !apagados.includes(full)) pmcps.push({ n, full, c: conRaiz(c, p.root), p });
  }
}
const porClave = {};
for (const m of pmcps) { const k = clave(m.c); if (k) (porClave[k] = porClave[k] || []).push(m); }
const origen = m => `${m.full} (${m.p.id})`;

const seen = {};
for (const m of mcps) {
  const s = sig(m.c);
  const dupOes = Object.entries(OES_MCP).find(([k, v]) => s.includes(v) || lower(m.n) === k);
  const q = quitarMotivo(m.n + ' ' + s);
  const key = clave(m.c);
  const enPlugins = porClave[key] || [];
  if (seen[key]) push('conector', m.n, m.scope, 'duplicado', `Mismo servidor que "${seen[key]}"`, 'quitar uno');
  else if (enPlugins.length) push('conector', m.n, m.scope, 'duplicado', `Mismo servidor que ${enPlugins.map(origen).join(' y ')}`, `claude mcp remove ${m.n} -s ${scopeCli[m.scope]}`);
  else if (dupOes) push('conector', m.n, m.scope, 'duplicado', `OES ya trae ${dupOes[0]} (plugin)`, `claude mcp remove ${m.n} -s ${scopeCli[m.scope]}`);
  else if (lower(m.n).includes('github')) push('conector', m.n, m.scope, 'neutro', 'OES usa gh CLI (menos contexto). Dejarlo no rompe nada', 'decidir');
  else if (q) push('conector', m.n, m.scope, 'conviene quitar', q, 'quitar');
  else if (lower(m.n).includes('firecrawl')) push('conector', m.n, m.scope, 'útil', 'Lectura de webs y kit de marca', 'dejar');
  else push('conector', m.n, m.scope, 'neutro', 'No es parte de OES', 'decidir');
  seen[key] = seen[key] || m.n;
}
// Mismo servidor en dos plugins. Si uno es un plugin dedicado (p. ej. supabase) y el otro es OES, sobra la copia de OES:
// el plugin dedicado trae además sus skills y se actualiza con el servicio.
const dosVeces = new Set();
for (const grupo of Object.values(porClave)) {
  if (grupo.length < 2) continue;
  const queda = grupo.find(m => m.p.nombre !== 'oes') || grupo[0];
  for (const m of grupo) {
    if (m === queda) continue;
    if (m.full === queda.full) { // mismo plugin cargado desde dos lugares (p. ej. oes@synced y oes@oes-studio)
      if (!dosVeces.has(m.p.id)) push('plugin', m.p.id, 'cargado dos veces', 'duplicado', `Mismo plugin que ${queda.p.id}: sus conectores corren dos veces`, 'dejar uno solo');
      dosVeces.add(m.p.id);
      continue;
    }
    if (dosVeces.has(m.full)) continue; // misma fila: /mcp disable apaga por nombre
    dosVeces.add(m.full);
    const motivo = m.p.nombre === 'oes' && queda.p.nombre !== 'oes' ? 'ese plugin ya lo trae, la copia de OES sobra' : 'corre dos veces o Claude Code descarta uno';
    push('conector', m.full, `plugin ${m.p.id}`, 'duplicado', `Mismo servidor que ${origen(queda)}: ${motivo}`, `/mcp disable ${m.full} (en cada proyecto)`);
  }
}

// ---------- Agentes ----------
const OES_AG = ['Explore', 'planner', 'implementer', 'reviewer', 'designer', 'tester', 'notes'];
for (const e of ls(path.join(C, 'agents'))) {
  if (!e.name.endsWith('.md')) continue;
  const n = e.name.replace(/\.md$/, '');
  const t = (() => { try { return fs.readFileSync(path.join(C, 'agents', e.name), 'utf8'); } catch (_) { return ''; } })();
  const esOes = t.includes('equipo OES');
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
console.log('| Veredicto | Tipo | Elemento | Estado | Motivo | Acción sugerida |\n|---|---|---|---|---|---|');
out.items.sort((a, b) => orden[a.veredicto] - orden[b.veredicto]).forEach(i => console.log(`| ${i.veredicto} | ${i.tipo} | ${i.nombre} | ${i.estado} | ${i.motivo} | ${i.accion} |`));
const cnt = v => out.items.filter(i => i.veredicto === v).length;
console.log(`\nResumen: ${cnt('útil')} útiles · ${cnt('neutro')} neutros · ${cnt('duplicado')} duplicados · ${cnt('conviene quitar')} para quitar · ${cnt('falta')} faltan.`);
