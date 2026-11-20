// Utilidades comunes de OES-Studio (sin dependencias).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = (process.env.CLAUDE_CONFIG_DIR || '').trim() || path.join(os.homedir(), '.claude');
const OES = path.join(CLAUDE_DIR, 'oes');
const STATE = path.join(OES, 'state');

function ensureDir(d) { try { fs.mkdirSync(d, { recursive: true }); } catch (_) {} }
function readJSON(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return def; } }
function writeJSON(p, obj) { ensureDir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }
function appendLine(p, obj) { ensureDir(path.dirname(p)); fs.appendFileSync(p, JSON.stringify(obj) + '\n'); }
function readStdin() {
  try { const t = fs.readFileSync(0, 'utf8'); return t ? JSON.parse(t) : {}; } catch (_) { return {}; }
}
function readJSONL(p) {
  try {
    return fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
  } catch (_) { return []; }
}
function safeId(s) { return String(s || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_'); }

// ¿Dos rutas son la misma carpeta? Resuelve symlinks/junctions si existen; en Windows sin distinguir mayúsculas.
// Si ambas existen, compara también dispositivo + inodo (cubre bind mounts y diferencias de mayúsculas en macOS).
function samePath(a, b) {
  const real = p => { try { return fs.realpathSync.native(p); } catch (_) { return path.resolve(p); } };
  let x = real(a), y = real(b);
  if (process.platform === 'win32') { x = x.toLowerCase(); y = y.toLowerCase(); }
  if (x === y) return true;
  try {
    const s = fs.statSync(a, { bigint: true }), t = fs.statSync(b, { bigint: true });
    return s.ino !== 0n && s.dev === t.dev && s.ino === t.ino;
  } catch (_) { return false; }
}

// Contexto real del último turno leyendo el transcript (fallback cuando la statusline no trae el dato).
function contextFromTranscript(transcriptPath, modelId) {
  try {
    const st = fs.statSync(transcriptPath);
    const size = Math.min(st.size, 512 * 1024);
    const fd = fs.openSync(transcriptPath, 'r');
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, st.size - size);
    fs.closeSync(fd);
    const lines = buf.toString('utf8').split(/\r?\n/).reverse();
    for (const l of lines) {
      if (!l.includes('"usage"')) continue;
      let j; try { j = JSON.parse(l); } catch (_) { continue; }
      if (j.isSidechain) continue;
      const u = j.message && j.message.usage;
      if (!u) continue;
      const tokens = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
      const mid = modelId || (j.message && j.message.model) || '';
      const win = (/\[1m\]/i.test(mid) || tokens > 200000) ? 1000000 : 200000;
      return { tokens, window: win, pct: Math.round((tokens / win) * 100) };
    }
  } catch (_) {}
  return null;
}

module.exports = { fs, path, os, CLAUDE_DIR, OES, STATE, ensureDir, readJSON, writeJSON, appendLine, readStdin, readJSONL, safeId, samePath, contextFromTranscript };
