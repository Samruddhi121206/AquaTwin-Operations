/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Industrial PLC Communication Backend Service
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { IPLCDriver } from './drivers/IPLCDriver';
import { VirtualPLCDriver } from './drivers/VirtualPLCDriver';
import { MitsubishiSLMPDriver } from './drivers/MitsubishiSLMPDriver';

const app = express();
app.use(express.json());

// Enable CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Active driver state (Virtual PLC by default until physical PLC is connected)
let activeDriver: IPLCDriver = new VirtualPLCDriver();
activeDriver.connect();

const INITIAL_TAGS = [
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

// Telemetry WebSocket broadcast loop (500ms cycle)
setInterval(async () => {
  if (wss.clients.size === 0) return;

  try {
    const readings = await activeDriver.readBatch(INITIAL_TAGS);
    const status = activeDriver.getStatus();

    const payload = JSON.stringify({
      type: 'TELEMETRY_PACKET',
      timestamp: new Date().toISOString(),
      status,
      readings,
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  } catch (err) {
    // broadcast error
  }
}, 500);

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  // Send initial state immediately upon connect
  ws.send(
    JSON.stringify({
      type: 'CONNECTION_ACK',
      timestamp: new Date().toISOString(),
      driver: activeDriver.name,
      status: activeDriver.getStatus(),
    })
  );

  ws.on('message', async (message: any) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'WRITE_TAG') {
        const result = await activeDriver.writeTag(
          data.tagId,
          data.address,
          data.value,
          data.token
        );
        ws.send(JSON.stringify({ type: 'WRITE_RESULT', result }));
      }
    } catch (e) {
      // ignore malformed
    }
  });
});

// REST Endpoints
app.get('/api/plc/status', (req, res) => {
  res.json({
    status: activeDriver.getStatus(),
    driver: activeDriver.name,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/plc/mode', async (req, res) => {
  const { mode, host, port } = req.body;
  await activeDriver.disconnect();

  if (mode === 'REAL') {
    activeDriver = new MitsubishiSLMPDriver({
      host: host || '192.168.1.10',
      port: port || 5007,
      family: 'iQ-R',
      cpuModel: 'R08CPU',
    });
    const connected = await activeDriver.connect();
    res.json({ success: connected, mode: 'REAL', driver: activeDriver.name });
  } else {
    activeDriver = new VirtualPLCDriver();
    await activeDriver.connect();
    res.json({ success: true, mode: 'VIRTUAL', driver: activeDriver.name });
  }
});

app.post('/api/plc/ping', async (req, res) => {
  const result = await activeDriver.ping();
  res.json(result);
});

app.get('/api/plc/tags', async (req, res) => {
  const readings = await activeDriver.readBatch(INITIAL_TAGS);
  res.json({ readings });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`[AquaTwin Backend] Industrial PLC Service running on http://localhost:${PORT}`);
  console.log(`[AquaTwin Backend] WebSocket Gateway listening at ws://localhost:${PORT}/ws`);
  console.log(`[AquaTwin Backend] Initial Driver: ${activeDriver.name}`);
});
