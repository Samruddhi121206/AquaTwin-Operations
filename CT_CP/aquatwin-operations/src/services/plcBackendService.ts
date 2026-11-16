/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin frontend client for the backend PLC gateway. The browser never talks to the PLC itself.
 */
import { useEffect, useState } from 'react';

export interface GatewayStatus {
  connected: boolean; // true only after a valid protocol read (real) or simulation active (virtual)
  tcpOpen?: boolean;
  protocolVerified?: boolean;
  mode: 'VIRTUAL' | 'REAL';
  host: string;
  port: number;
  protocol: string;
  lastCommunicationTime: string | null;
  scanTimeMs: number;
  errorCount: number;
  lastErrorCode: string;
  cpuMode: string;
  readsOk?: number;
  readsFailed?: number;
  timeouts?: number;
  reconnects?: number;
  lastRttMs?: number;
  gatewayTagCount?: number;
}

export interface TelemetryPacket {
  type: string;
  timestamp: string;
  status: GatewayStatus;
  readings: Array<{ tagId: string; address: string; value: number | boolean | string; rawCounts?: number; quality: string; timestamp: string }>;
}

export interface TerminalEvent { ts: string; kind: string; level: 'INFO' | 'WARN' | 'ERROR'; text: string }
export interface GatewayResult { success: boolean; message?: string; [k: string]: any }

type PacketListener = (packet: TelemetryPacket) => void;
const HTTP = 'http://localhost:5001';

class PlcBackendService {
  private socket: WebSocket | null = null;
  private listeners = new Set<PacketListener>();
  private stateListeners = new Set<() => void>();
  private reconnectTimer: ReturnType<typeof setInterval> | null = null;

  /** Observable gateway state for the UI (read via usePlcGateway). */
  state: { reachable: boolean; status: GatewayStatus | null; events: TerminalEvent[]; lastPacketAt: number } = {
    reachable: false, status: null, events: [], lastPacketAt: 0,
  };

  private set(patch: Partial<typeof this.state>) {
    this.state = { ...this.state, ...patch };
    this.stateListeners.forEach((l) => l());
  }

  connect(url = 'ws://localhost:5001/ws') {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
    try {
      const ws = (this.socket = new WebSocket(url));
      ws.onopen = () => {
        if (this.reconnectTimer) { clearInterval(this.reconnectTimer); this.reconnectTimer = null; }
        this.set({ reachable: true });
      };
      ws.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'TELEMETRY_PACKET') {
            this.set({ status: m.status, lastPacketAt: Date.now() });
            this.listeners.forEach((l) => l(m));
          } else if (m.type === 'CONNECTION_ACK') {
            this.set({ status: m.status, events: m.history ?? [] });
          } else if (m.type === 'TERMINAL_EVENT') {
            this.set({ events: [...this.state.events, m.event].slice(-500) });
          }
        } catch { /* ignore malformed */ }
      };
      ws.onclose = () => {
        this.socket = null;
        this.set({ reachable: false, status: null });
        if (!this.reconnectTimer) this.reconnectTimer = setInterval(() => this.connect(url), 5000);
      };
      ws.onerror = () => ws.close();
    } catch {
      if (!this.reconnectTimer) this.reconnectTimer = setInterval(() => this.connect(url), 5000);
    }
  }

  subscribe(listener: PacketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  subscribeState(l: () => void): () => void {
    this.stateListeners.add(l);
    return () => this.stateListeners.delete(l);
  }

  /** Never fabricates success: an unreachable gateway is reported as a failure. */
  private async call(path: string, body?: unknown): Promise<GatewayResult> {
    try {
      const res = await fetch(HTTP + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      return await res.json();
    } catch {
      return { success: false, message: 'Backend gateway unreachable (is `npm run server` running?).' };
    }
  }

  connectReal(cfg: { host: string; port: number; family: string; cpuModel: string }) { return this.call('/api/plc/mode', { mode: 'REAL', ...cfg }); }
  useVirtual() { return this.call('/api/plc/mode', { mode: 'VIRTUAL' }); }
  disconnect() { return this.call('/api/plc/disconnect'); }
  networkTest(host: string, port: number) { return this.call('/api/plc/ping', { host, port }); }
  readTest(address: string) { return this.call('/api/plc/read-test', { address }); }
  setPollList(tags: { tagId: string; address: string }[]) { return this.call('/api/plc/tags', { tags }); }
}

export const plcBackend = new PlcBackendService();

export function usePlcGateway() {
  const [, force] = useState(0);
  useEffect(() => {
    plcBackend.connect();
    return plcBackend.subscribeState(() => force((n) => n + 1));
  }, []);
  return plcBackend.state;
}
