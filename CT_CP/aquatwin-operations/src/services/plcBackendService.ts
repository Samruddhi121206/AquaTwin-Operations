/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Frontend PLC Gateway Communication Service
 */

export interface TelemetryPacket {
  type: string;
  timestamp: string;
  status: any;
  readings: Array<{
    tagId: string;
    address: string;
    value: number | boolean | string;
    rawCounts?: number;
    quality: string;
    timestamp: string;
  }>;
}

type PacketListener = (packet: TelemetryPacket) => void;

class PlcBackendService {
  private socket: WebSocket | null = null;
  private listeners: Set<PacketListener> = new Set();
  private isConnecting = false;
  private reconnectInterval: any = null;

  connect(url = 'ws://localhost:5001/ws') {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.isConnecting = true;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(packet));
        } catch (e) {
          // ignore
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.scheduleReconnect(url);
      };

      this.socket.onerror = () => {
        // silent failover to browser simulation
        this.socket?.close();
      };
    } catch (e) {
      this.scheduleReconnect(url);
    }
  }

  private scheduleReconnect(url: string) {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.connect(url);
      }, 5000);
    }
  }

  subscribe(listener: PacketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async setMode(mode: 'VIRTUAL' | 'REAL', host?: string, port?: number) {
    try {
      const res = await fetch('http://localhost:5001/api/plc/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, host, port }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, mode, simulated: true };
    }
  }

  async ping() {
    try {
      const res = await fetch('http://localhost:5001/api/plc/ping', { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: true, latencyMs: 1, message: 'In-browser Virtual Engine Active' };
    }
  }
}

export const plcBackend = new PlcBackendService();
