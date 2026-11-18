#!/usr/bin/env node
// Instala la parte de archivos de OES: agentes, reglas, bloque de CLAUDE.md, statusline y scripts estables.
// Idempotente: no duplica; hace copia .bak de lo que reemplaza.
// Uso: node oes-install.js [--no-agents] [--no-statusline] [--no-claudemd] [--no-rules]
'use strict';
const L = require('./lib');
const { fs, path } = L;
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const C = L.CLAUDE_DIR;
const res = [];
const ok = (q, e) => res.push({ que: q, estado: e });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = p => { if (fs.existsSync(p)) { const b = path.join(L.OES, 'backup', stamp); L.ensureDir(b); fs.copyFileSync(p, path.join(b, path.basename(p))); return true; } return false; };
const same = (a, b) => { try { return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8'); } catch (_) { return false; } };
function copyDir(src, dst) { L.ensureDir(dst); for (const e of fs.readdirSync(src, { withFileTypes: true })) { const s = path.join(src, e.name), d = path.join(dst, e.name); e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d); } }

L.ensureDir(L.OES); L.ensureDir(L.STATE);

// 1. Scripts estables (la ruta del plugin cambia con cada versión; la statusline necesita una fija)
const bin = path.join(L.OES, 'bin'); L.ensureDir(bin);
for (const f of ['lib.js', 'statusline.js', 'report-usage.js', 'report-agents.js', 'context-audit.js', 'inventory.js']) fs.copyFileSync(path.join(__dirname, f), path.join(bin, f));
ok('Scripts en ~/.claude/oes/bin', 'actualizado');

// 2. Agentes
if (!args.includes('--no-agents')) {
  const ad = path.join(C, 'agents'); L.ensureDir(ad);
  for (const f of fs.readdirSync(path.join(ROOT, 'agents-templates'))) {
    const src = path.join(ROOT, 'agents-templates', f), dst = path.join(ad, f);
    if (same(src, dst)) { ok('Agente ' + f.replace('.md', ''), 'ya estaba'); continue; }
    const had = backup(dst); fs.copyFileSync(src, dst);
    ok('Agente ' + f.replace('.md', ''), had ? 'reemplazado (copia en backup)' : 'instalado');
  }
}

// 3. Reglas comunes (ECC, MIT)
if (!args.includes('--no-rules')) {
  const rd = path.join(C, 'rules', 'oes');
  const existed = fs.existsSync(rd);
  copyDir(path.join(ROOT, 'rules'), rd);
  ok('Reglas comunes en ~/.claude/rules/oes', existed ? 'actualizadas' : 'instaladas');
}

// 4. Bloque OES en CLAUDE.md global
if (!args.includes('--no-claudemd')) {
  const gm = path.join(C, 'CLAUDE.md');
  const block = fs.readFileSync(path.join(ROOT, 'templates', 'CLAUDE.global.md'), 'utf8').trim();
  let cur = fs.existsSync(gm) ? fs.readFileSync(gm, 'utf8') : '';
  const re = /<!-- OES:START[\s\S]*?<!-- OES:END -->/;
  let estado;
  if (re.test(cur)) { const nxt = cur.replace(re, block); estado = nxt === cur ? 'ya estaba' : 'actualizado'; if (nxt !== cur) { backup(gm); fs.writeFileSync(gm, nxt); } }
  else { backup(gm); fs.writeFileSync(gm, (cur.trim() ? cur.trimEnd() + '\n\n' : '') + block + '\n'); estado = cur ? 'agregado (tu contenido se conserva)' : 'creado'; }
  ok('Bloque OES en ~/.claude/CLAUDE.md', estado);
}

// 5. Statusline
if (!args.includes('--no-statusline')) {
  const sp = path.join(C, 'settings.json');
  const s = L.readJSON(sp, {});
  const cmd = `node "${path.join(bin, 'statusline.js').replace(/\\/g, '/')}"`;
  if (s.statusLine && s.statusLine.command === cmd) ok('Statusline OES', 'ya estaba');
  else {
    const prev = s.statusLine; backup(sp);
    s.statusLine = { type: 'command', command: cmd, padding: 0 };
    if (s.env && s.env.CLAUDE_CODE_SUBAGENT_MODEL) { delete s.env.CLAUDE_CODE_SUBAGENT_MODEL; ok('CLAUDE_CODE_SUBAGENT_MODEL', 'quitado (pisaba los modelos por agente)'); }
    L.writeJSON(sp, s);
    ok('Statusline OES', prev ? 'reemplazada (copia en backup)' : 'instalada');
  }
}

// 6. Config y marca de instalado
const cfgP = path.join(L.OES, 'config.json');
if (!fs.existsSync(cfgP)) L.writeJSON(cfgP, { obsidianVault: null, contextWarn: [70, 85] });
const pj = L.readJSON(path.join(ROOT, '.claude-plugin', 'plugin.json'), {});
L.writeJSON(path.join(L.OES, 'installed.json'), { version: pj.version, fecha: new Date().toISOString(), pluginRoot: ROOT });
ok('Marca de instalación', 'ok');

console.log('| Qué | Estado |\n|---|---|');
res.forEach(r => console.log(`| ${r.que} | ${r.estado} |`));
