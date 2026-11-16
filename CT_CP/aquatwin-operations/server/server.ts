/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Industrial PLC Communication Backend Service
 */

import express from 'express';
import http from 'http';
import net from 'net';
import { WebSocketServer, WebSocket } from 'ws';
import { IPLCDriver } from './drivers/IPLCDriver';
import { VirtualPLCDriver } from './drivers/VirtualPLCDriver';
import { MitsubishiSLMPDriver } from './drivers/MitsubishiSLMPDriver';
import { PLCFamily } from './types';

const app = express();
app.use(express.json());

// Dev CORS (the Vite dev server is on another port). Restrict in deployment.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// ---- terminal event log (real backend events; also broadcast live) ----
type Level = 'INFO' | 'WARN' | 'ERROR';
interface TermEvent { ts: string; kind: 'CONNECT' | 'READ' | 'VALUE' | 'QUALITY' | 'WRITE' | 'SYSTEM'; level: Level; text: string }
const events: TermEvent[] = [];
const broadcast = (obj: unknown) => {
  const msg = JSON.stringify(obj);
  for (const c of wss.clients) if (c.readyState === WebSocket.OPEN) c.send(msg);
};
const log = (kind: TermEvent['kind'], level: Level, text: string) => {
  const event: TermEvent = { ts: new Date().toISOString(), kind, level, text };
  events.push(event);
  if (events.length > 500) events.shift();
  broadcast({ type: 'TERMINAL_EVENT', event });
};

// ---- active driver: Virtual PLC until a real session is explicitly requested ----
let activeDriver: IPLCDriver = new VirtualPLCDriver();
activeDriver.connect();
log('SYSTEM', 'INFO', 'Gateway started. Virtual PLC active (SIMULATION).');

const SAMPLE_TAGS = [
  { tagId: 'TK101_LEVEL', address: 'D100' },
  { tagId: 'FT101_FLOW', address: 'D102' },
  { tagId: 'PT101_PRESSURE', address: 'D104' },
  { tagId: 'RO_FEED_PRESS', address: 'D106' },
  { tagId: 'P101_RUN_FB', address: 'X0.0' },
  { tagId: 'P101_TRIP', address: 'X0.1' },
  { tagId: 'TK101_LSH', address: 'X0.2' },
  { tagId: 'TK101_LSL', address: 'X0.3' },
  { tagId: 'XV101_OPEN_FB', address: 'X0.4' },
  { tagId: 'P201_RUN_FB', address: 'X0.5' },
  { tagId: 'P101_RUN_CMD', address: 'Y0.0' },
  { tagId: 'XV101_OPEN_CMD', address: 'Y0.1' },
  { tagId: 'P201_RUN_CMD', address: 'Y0.2' },
];
/** Real PLC: ONLY addresses the engineer has explicitly allowlisted (never the sample list). */
let realTags: { tagId: string; address: string }[] = [];
const COMMAND_ALLOWLIST = new Set(['P101_RUN_CMD', 'XV101_OPEN_CMD', 'P201_RUN_CMD']); // virtual PLC only

const isReal = () => activeDriver.getStatus().mode === 'REAL';
const statusPacket = () => ({ ...activeDriver.getStatus(), gatewayTagCount: isReal() ? realTags.length : SAMPLE_TAGS.length });

// ---- poll loop: one loop for the whole backend ----
const lastValue = new Map<string, string>();
let lastReadLog = 0;
let lastVerified: boolean | null = null;
let busy = false;

setInterval(async () => {
  if (wss.clients.size === 0 || busy) return;
  busy = true;
  try {
    const tags = isReal() ? realTags : SAMPLE_TAGS;
    const t0 = Date.now();
    const readings = tags.length ? await activeDriver.readBatch(tags) : [];
    const ms = Date.now() - t0;
    const status = statusPacket();

    if (tags.length) {
      const bad = readings.filter((r) => r.quality === 'BAD').length;
      const now = Date.now();
      if (now - lastReadLog > 5000 || (bad > 0 && lastValue.get('__bad') !== String(bad))) {
        log('READ', bad ? 'ERROR' : 'INFO', `Batch - ${tags.length} devices - ${bad ? `${bad} FAILED` : 'OK'} - ${ms} ms`);
        lastReadLog = now;
      }
      lastValue.set('__bad', String(bad));
      for (const r of readings) {
        const v = `${r.value}|${r.quality}`;
        if (lastValue.get(r.tagId) !== v) {
          if (lastValue.has(r.tagId) && r.quality === 'BAD') log('QUALITY', 'WARN', `${r.tagId} (${r.address}) = BAD`);
          else log('VALUE', 'INFO', `${r.tagId} = ${typeof r.value === 'boolean' ? (r.value ? 'ON' : 'OFF') : r.value}`);
          lastValue.set(r.tagId, v);
        }
      }
    }
    if (isReal() && lastVerified !== status.protocolVerified) {
      log('CONNECT', status.protocolVerified ? 'INFO' : 'WARN', status.protocolVerified ? 'SLMP session verified by a valid read.' : 'SLMP session NOT verified (no valid response).');
      lastVerified = !!status.protocolVerified;
    }
    broadcast({ type: 'TELEMETRY_PACKET', timestamp: new Date().toISOString(), status, readings });
  } catch (err) {
    log('SYSTEM', 'ERROR', `Poll loop error: ${(err as Error).message}`);
  } finally {
    busy = false;
  }
}, 500);

wss.on('connection', (ws: WebSocket) => {
  ws.send(JSON.stringify({ type: 'CONNECTION_ACK', timestamp: new Date().toISOString(), driver: activeDriver.name, status: statusPacket(), history: events.slice(-100) }));

  ws.on('message', async (message: any) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type !== 'WRITE_TAG') return;
      const { tagId, address, value, token } = data;
      let result;
      if (isReal()) {
        result = await activeDriver.writeTag(tagId, address, value, token); // always blocked
      } else if (!COMMAND_ALLOWLIST.has(tagId)) {
        result = { success: false, tagId, address, valueWritten: value, message: `BLOCKED: ${tagId} is not an allowlisted command tag.`, timestamp: new Date().toISOString() };
      } else {
        result = await activeDriver.writeTag(tagId, address, value, token);
      }
      log('WRITE', result.success ? 'INFO' : 'WARN', `${tagId} = ${String(value)} - ${result.success ? 'OK (SIM)' : result.message}`);
      ws.send(JSON.stringify({ type: 'WRITE_RESULT', result }));
    } catch {
      // malformed message: ignore
    }
  });
});

// ---- REST ----
app.get('/api/plc/status', (_req, res) => res.json({ status: statusPacket(), driver: activeDriver.name, timestamp: new Date().toISOString() }));
app.get('/api/plc/diagnostics', (_req, res) => res.json({ status: statusPacket(), driver: activeDriver.name, gatewayUptimeS: Math.round(process.uptime()) }));
app.get('/api/plc/terminal/history', (_req, res) => res.json({ events }));

const ADDRESS = /^(SM|SD|[DWXYM])[0-9A-F]+(\.[0-9A-F])?$/i;

app.post('/api/plc/mode', async (req, res) => {
  const { mode, host, port, family, cpuModel } = req.body ?? {};
  await activeDriver.disconnect();
  if (mode === 'REAL') {
    const p = Number(port);
    if (typeof host !== 'string' || !host.trim() || !Number.isInteger(p) || p < 1 || p > 65535) {
      activeDriver = new VirtualPLCDriver();
      await activeDriver.connect();
      return res.status(400).json({ success: false, message: 'REAL mode needs a host and a port (1-65535). No defaults are assumed.' });
    }
    const fam: PLCFamily = ['iQ-R', 'iQ-F', 'Q', 'L', 'FX5'].includes(family) ? family : 'iQ-R';
    activeDriver = new MitsubishiSLMPDriver({ host: host.trim(), port: p, family: fam, cpuModel: typeof cpuModel === 'string' ? cpuModel : '' });
    lastVerified = null;
    lastValue.clear();
    log('CONNECT', 'INFO', `Opening TCP session to ${host.trim()}:${p} (read-only)...`);
    const tcp = await activeDriver.connect();
    log('CONNECT', tcp ? 'INFO' : 'ERROR', tcp ? 'TCP open. Protocol NOT yet verified: run a Read Test.' : `TCP connection failed (${activeDriver.getStatus().lastErrorCode}).`);
    return res.json({ success: tcp, mode: 'REAL', verified: false, status: statusPacket() });
  }
  activeDriver = new VirtualPLCDriver();
  await activeDriver.connect();
  log('SYSTEM', 'INFO', 'Switched to Virtual PLC (SIMULATION).');
  res.json({ success: true, mode: 'VIRTUAL', status: statusPacket() });
});

app.post('/api/plc/disconnect', async (_req, res) => {
  await activeDriver.disconnect();
  log('CONNECT', 'INFO', 'Disconnected by user.');
  res.json({ success: true, status: statusPacket() });
});

/** TCP reachability probe of an arbitrary endpoint (throwaway socket; no session, no PLC data). */
const tcpProbe = (host: string, port: number, timeoutMs = 2500) =>
  new Promise<{ success: boolean; latencyMs: number; message: string }>((resolve) => {
    const start = Date.now();
    const sock = new net.Socket();
    const end = (success: boolean, message: string) => {
      sock.destroy();
      resolve({ success, latencyMs: Date.now() - start, message });
    };
    sock.setTimeout(timeoutMs);
    sock.once('connect', () => end(true, `TCP port ${port} on ${host} reachable. This does not prove SLMP is configured; run Read Test.`));
    sock.once('timeout', () => end(false, `No TCP response from ${host}:${port}`));
    sock.once('error', (e) => end(false, `TCP error: ${e.message}`));
    sock.connect(port, host);
  });

app.post('/api/plc/ping', async (req, res) => {
  const { host, port } = req.body ?? {};
  if (host === undefined && port === undefined) return res.json(await activeDriver.ping());
  const p = Number(port);
  if (typeof host !== 'string' || !host.trim() || !Number.isInteger(p) || p < 1 || p > 65535) {
    return res.status(400).json({ success: false, latencyMs: 0, message: 'Network test needs a host and a port (1-65535).' });
  }
  const r = await tcpProbe(host.trim(), p);
  log('CONNECT', r.success ? 'INFO' : 'WARN', `Network test ${host.trim()}:${p}: ${r.message}`);
  return res.json(r);
});

app.post('/api/plc/ping-active', async (_req, res) => {
  const r = await activeDriver.ping();
  log('CONNECT', r.success ? 'INFO' : 'WARN', `Network test: ${r.message}`);
  res.json(r);
});

app.post('/api/plc/read-test', async (req, res) => {
  if (!isReal()) return res.status(409).json({ success: false, message: 'Read Test needs a Real PLC session (none active).' });
  const address = String(req.body?.address ?? '').trim();
  if (!ADDRESS.test(address)) return res.status(400).json({ success: false, message: 'Invalid device address (e.g. D100, M0, X10).' });
  const t0 = Date.now();
  const r = await activeDriver.readTag('READ_TEST', address);
  const ms = Date.now() - t0;
  log('READ', r.quality === 'GOOD' ? 'INFO' : 'ERROR', `Read test ${address} = ${r.quality === 'GOOD' ? String(r.value) : 'FAILED'} - ${ms} ms`);
  res.json({ success: r.quality === 'GOOD', reading: r, durationMs: ms, status: statusPacket() });
});

/** Allowlist of devices the gateway may poll in Real mode. */
app.post('/api/plc/tags', (req, res) => {
  const tags = req.body?.tags;
  if (!Array.isArray(tags) || tags.length > 200 || !tags.every((t) => typeof t?.tagId === 'string' && ADDRESS.test(String(t?.address)))) {
    return res.status(400).json({ success: false, message: 'Expected up to 200 tags with valid tagId and address.' });
  }
  realTags = tags.map((t: any) => ({ tagId: t.tagId, address: String(t.address).toUpperCase() }));
  log('SYSTEM', 'INFO', `Real PLC poll list set: ${realTags.length} device(s).`);
  res.json({ success: true, count: realTags.length });
});

app.get('/api/plc/tags', async (_req, res) => {
  const tags = isReal() ? realTags : SAMPLE_TAGS;
  res.json({ readings: tags.length ? await activeDriver.readBatch(tags) : [] });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`[AquaTwin Backend] PLC gateway on http://localhost:${PORT} (ws://localhost:${PORT}/ws)`);
});
