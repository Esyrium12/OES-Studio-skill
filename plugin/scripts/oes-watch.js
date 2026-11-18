#!/usr/bin/env node
// Vigilador de agentes: registra lanzamientos y cierres de subagentes y,
// si el panel visual está encendido, reenvía todos los eventos a http://localhost:4000/events.
'use strict';
const L = require('./lib');
const http = require('http');
const event = process.argv[2] || 'Unknown';
const j = L.readStdin();
const now = Date.now();
const LOG = L.path.join(L.OES, 'agents.jsonl');
const isAgentTool = n => n === 'Task' || n === 'Agent';

// Mensajes de inicio de sesión: falta setup / hay un traspaso pendiente para continuar.
if (event === 'SessionStart') {
  const msgs = [];
  if (!L.fs.existsSync(L.path.join(L.OES, 'installed.json'))) msgs.push('[OES] Plugin instalado pero sin configurar. Decile al usuario en una línea que ejecute /oes:setup.');
  try {
    const hp = L.path.join(j.cwd || process.cwd(), 'docs', 'handoff.md');
    if (L.fs.existsSync(hp)) {
      const t = L.fs.readFileSync(hp, 'utf8');
      if (/estado:\s*pendiente/i.test(t)) msgs.push('[OES] Hay un traspaso pendiente en docs/handoff.md (sesión anterior cortada por límite). Decile al usuario en una línea que puede retomar con /oes:continuar.');
    }
  } catch (_) {}
  if (msgs.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: msgs.join(' ') } }));
}

try {
  if (event === 'SessionStart' && process.env.CLAUDE_PLUGIN_ROOT) {
    L.ensureDir(L.OES);
    L.fs.writeFileSync(L.path.join(L.OES, 'plugin-root.txt'), process.env.CLAUDE_PLUGIN_ROOT);
  }
  if (event === 'PreToolUse' && isAgentTool(j.tool_name)) {
    const ti = j.tool_input || {};
    L.appendLine(LOG, { ts: now, ev: 'start', session_id: j.session_id, id: j.tool_use_id, agent: ti.subagent_type || 'general-purpose', model: ti.model || null, desc: (ti.description || '').slice(0, 120), cwd: j.cwd });
  } else if (event === 'PostToolUse' && isAgentTool(j.tool_name)) {
    const r = j.tool_response || {};
    const u = r.usage || {};
    const tokens = r.totalTokens || ((u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)) || null;
    L.appendLine(LOG, { ts: now, ev: 'end', session_id: j.session_id, id: j.tool_use_id, agent: (j.tool_input || {}).subagent_type || 'general-purpose', tokens, ms: r.totalDurationMs || null, tools: r.totalToolUseCount || null });
  } else if (event === 'SubagentStop') {
    L.appendLine(LOG, { ts: now, ev: 'stop', session_id: j.session_id, agent: j.agent_type || null, agent_id: j.agent_id || null });
  }
} catch (_) {}

// Reenvío al panel (solo si está encendido).
const flag = L.path.join(L.OES, 'dashboard.on');
if (L.fs.existsSync(flag)) {
  try {
    const app = (j.cwd || process.cwd()).split(/[\\/]/).filter(Boolean).pop() || 'oes';
    const body = JSON.stringify({ source_app: app, session_id: j.session_id || 'unknown', hook_event_type: event, payload: j, timestamp: now, tool_name: j.tool_name, tool_use_id: j.tool_use_id, agent_id: j.agent_id, agent_type: j.agent_type });
    const req = http.request({ host: '127.0.0.1', port: 4000, path: '/events', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, timeout: 400 }, res => { res.resume(); res.on('end', () => process.exit(0)); });
    req.on('error', () => process.exit(0));
    req.on('timeout', () => { req.destroy(); process.exit(0); });
    req.end(body);
  } catch (_) { process.exit(0); }
} else {
  process.exit(0);
}
