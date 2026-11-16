/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Physical Mitsubishi Electric MELSEC SLMP 3E Binary Driver
 * 
 * Supports: MELSEC iQ-R, MELSEC iQ-F (FX5), MELSEC Q series
 * Standard SLMP Port: 5007 / 1025
 */

import net from 'net';
import { IPLCDriver } from './IPLCDriver';
import { PLCConnectionConfig, PLCDriverStatus, TagReadResult, TagWriteResult } from '../types';

export class MitsubishiSLMPDriver implements IPLCDriver {
  readonly id = 'MITSUBISHI_SLMP_3E';
  readonly name = 'Mitsubishi Electric SLMP (MC Protocol 3E Binary Frame)';

  private config: PLCConnectionConfig;
  private socket: net.Socket | null = null;
  private connected = false;
  private lastCommTime: string | null = null;
  private lastErrorCode = '0000';
  private errorCount = 0;
  private scanTimeMs = 0;
  /** true only after a valid SLMP response (end code 0): a TCP connection alone is not a verified session. */
  private verified = false;
  private queue: Promise<unknown> = Promise.resolve();
  private stats = { readsOk: 0, readsFailed: 0, timeouts: 0, reconnects: 0, lastRttMs: 0 };

  // Device type code mapping for Mitsubishi MELSEC
  private static readonly DEVICE_CODES: Record<string, number> = {
    D: 0xa8, // Data Register (Word)
    W: 0xb4, // Link Register (Word)
    X: 0x9c, // Input Relay (Bit - Octal on FX5/iQ-R)
    Y: 0x9d, // Output Relay (Bit - Octal on FX5/iQ-R)
    M: 0x90, // Internal Relay (Bit)
    SM: 0x91, // Special Relay (Bit)
    SD: 0xa9, // Special Register (Word)
    TN: 0xc2, // Timer Current Value
    CN: 0xc5, // Counter Current Value
  };

  constructor(config: Partial<PLCConnectionConfig> = {}) {
    this.config = {
      host: config.host ?? '',
      port: config.port ?? 0,
      family: config.family ?? 'iQ-R',
      cpuModel: config.cpuModel ?? '',
      protocol: 'SLMP_3E',
      timeoutMs: config.timeoutMs || 2500,
      scanIntervalMs: config.scanIntervalMs || 500,
      readOnly: config.readOnly ?? true,
    };
  }

  async connect(): Promise<boolean> {
    if (this.connected) this.stats.reconnects++;
    this.socket?.destroy();
    this.verified = false;
    return new Promise((resolve) => {
      const sock = new net.Socket();
      this.socket = sock;
      sock.setTimeout(this.config.timeoutMs);
      sock.once('connect', () => {
        this.connected = true; // TCP only; `verified` stays false until a valid SLMP read
        this.lastErrorCode = '0000';
        sock.setTimeout(0);
        resolve(true);
      });
      const fail = (code: string) => {
        this.connected = false;
        this.verified = false;
        this.lastErrorCode = code;
        this.errorCount++;
        sock.destroy();
        resolve(false);
      };
      sock.on('error', () => fail('TCP_ERROR'));
      sock.on('timeout', () => fail('TCP_TIMEOUT'));
      sock.on('close', () => {
        if (this.socket === sock) {
          this.connected = false;
          this.verified = false;
        }
      });
      sock.connect(this.config.port, this.config.host);
    });
  }

  async disconnect(): Promise<boolean> {
    this.socket?.destroy();
    this.socket = null;
    this.connected = false;
    this.verified = false;
    return true;
  }

  isConnected(): boolean {
    return this.verified;
  }

  getStatus(): PLCDriverStatus {
    return {
      connected: this.verified,
      tcpOpen: this.connected,
      protocolVerified: this.verified,
      mode: 'REAL',
      host: this.config.host,
      port: this.config.port,
      protocol: 'SLMP_3E_BINARY',
      lastCommunicationTime: this.lastCommTime,
      scanTimeMs: this.scanTimeMs,
      errorCount: this.errorCount,
      lastErrorCode: this.lastErrorCode,
      cpuMode: 'UNKNOWN', // not read from the CPU; never assumed RUN
      batteryStatus: 'UNKNOWN',
      ...this.stats,
    };
  }

  /**
   * Parse a Mitsubishi address string (e.g. "D100", "X0", "X0.0", "Y0")
   */
  private parseAddress(addrStr: string): { deviceCode: number; headDevice: number; isBit: boolean } {
    const cleaned = addrStr.toUpperCase().trim();
    let devPrefix = 'D';
    let numStr = '0';

    if (cleaned.startsWith('SM')) {
      devPrefix = 'SM';
      numStr = cleaned.substring(2);
    } else if (cleaned.startsWith('SD')) {
      devPrefix = 'SD';
      numStr = cleaned.substring(2);
    } else if (cleaned.startsWith('D')) {
      devPrefix = 'D';
      numStr = cleaned.substring(1);
    } else if (cleaned.startsWith('W')) {
      devPrefix = 'W';
      numStr = cleaned.substring(1);
    } else if (cleaned.startsWith('X')) {
      devPrefix = 'X';
      numStr = cleaned.substring(1).replace('.', '');
    } else if (cleaned.startsWith('Y')) {
      devPrefix = 'Y';
      numStr = cleaned.substring(1).replace('.', '');
    } else if (cleaned.startsWith('M')) {
      devPrefix = 'M';
      numStr = cleaned.substring(1);
    }

    const deviceCode = MitsubishiSLMPDriver.DEVICE_CODES[devPrefix] || 0xa8;
    const isBit = ['X', 'Y', 'M', 'SM'].includes(devPrefix);

    // If octal notation for X/Y
    let headDevice = 0;
    if (devPrefix === 'X' || devPrefix === 'Y') {
      // X/Y are octal on iQ-F (FX5) and hexadecimal on iQ-R / Q / L.
      headDevice = parseInt(numStr, this.config.family === 'iQ-F' || this.config.family === 'FX5' ? 8 : 16);
    } else {
      headDevice = parseInt(numStr, 10);
    }

    if (isNaN(headDevice)) headDevice = 0;

    return { deviceCode, headDevice, isBit };
  }

  /**
   * Construct 3E Binary Batch Read Request
   */
  private build3EReadFrame(deviceCode: number, headDevice: number, isBit: boolean, count: number): Buffer {
    // 3E Binary Format (21 bytes total for read request):
    // Header (11 bytes):
    // [0-1] Subheader: 0x50, 0x00
    // [2] Network No: 0x00
    // [3] PC No: 0xFF
    // [4-5] Target module I/O: 0xFF, 0x03 (CPU)
    // [6] Target station: 0x00
    // [7-8] Data length: 0x0A, 0x00 (10 bytes follow)
    // [9-10] Monitoring timer: 0x10, 0x00 (4 seconds)
    // Command (10 bytes):
    // [11-12] Command: 0x01, 0x04 (0x0401 = Batch Read)
    // [13-14] Subcommand: 0x00, 0x00 (Word) or 0x01, 0x00 (Bit)
    // [15-17] Head device: 3 bytes little endian
    // [18] Device code: 1 byte
    // [19-20] Device count: 2 bytes little endian

    const buf = Buffer.alloc(21);
    buf.writeUInt8(0x50, 0);
    buf.writeUInt8(0x00, 1);
    buf.writeUInt8(0x00, 2);
    buf.writeUInt8(0xff, 3);
    buf.writeUInt8(0xff, 4);
    buf.writeUInt8(0x03, 5);
    buf.writeUInt8(0x00, 6);
    buf.writeUInt16LE(10, 7); // 10 bytes to follow
    buf.writeUInt16LE(0x0010, 9); // 4000ms timer
    buf.writeUInt16LE(0x0401, 11); // Command 0x0401
    buf.writeUInt16LE(isBit ? 0x0001 : 0x0000, 13); // Subcommand

    // Head device 3 bytes little endian
    buf.writeUInt8(headDevice & 0xff, 15);
    buf.writeUInt8((headDevice >> 8) & 0xff, 16);
    buf.writeUInt8((headDevice >> 16) & 0xff, 17);

    buf.writeUInt8(deviceCode, 18);
    buf.writeUInt16LE(count, 19);

    return buf;
  }

  /** Reads are serialised on the single socket and each has a timeout, so responses cannot be mismatched or hang. */
  readTag(tagId: string, address: string): Promise<TagReadResult> {
    const run = () => this.readOnce(tagId, address);
    const p = this.queue.then(run, run);
    this.queue = p;
    return p;
  }

  private bad(tagId: string, address: string): TagReadResult {
    this.stats.readsFailed++;
    return { tagId, address, value: 0, quality: 'BAD', timestamp: new Date().toISOString() };
  }

  private readOnce(tagId: string, address: string): Promise<TagReadResult> {
    const sock = this.socket;
    if (!this.connected || !sock) return Promise.resolve(this.bad(tagId, address));
    const { deviceCode, headDevice, isBit } = this.parseAddress(address);
    const frame = this.build3EReadFrame(deviceCode, headDevice, isBit, 1);

    return new Promise((resolve) => {
      const start = Date.now();
      let timer: ReturnType<typeof setTimeout>;
      const done = (r: TagReadResult | null, code?: string) => {
        clearTimeout(timer);
        sock.removeListener('data', onData);
        if (r) {
          this.verified = true;
          this.stats.readsOk++;
          this.stats.lastRttMs = this.scanTimeMs = Math.max(1, Date.now() - start);
          this.lastCommTime = new Date().toISOString();
          this.lastErrorCode = '0000';
          resolve(r);
        } else {
          this.verified = false;
          this.errorCount++;
          this.lastErrorCode = code ?? 'BAD_RESPONSE';
          resolve(this.bad(tagId, address));
        }
      };
      const onData = (data: Buffer) => {
        // 3E binary response: D0 00 ... [9-10] end code, [11+] data. Bit devices: 1st point in the HIGH nibble.
        if (data.length < 11) return done(null, 'SHORT_RESPONSE');
        const endCode = data.readUInt16LE(9);
        if (endCode !== 0) return done(null, endCode.toString(16).toUpperCase().padStart(4, '0'));
        if (data.length < (isBit ? 12 : 13)) return done(null, 'SHORT_RESPONSE');
        const value: number | boolean = isBit ? (data.readUInt8(11) & 0x10) !== 0 : data.readInt16LE(11);
        done({ tagId, address, value, rawCounts: typeof value === 'number' ? value : undefined, quality: 'GOOD', timestamp: new Date().toISOString() });
      };
      timer = setTimeout(() => {
        this.stats.timeouts++;
        done(null, 'READ_TIMEOUT');
      }, this.config.timeoutMs);
      sock.on('data', onData);
      sock.write(frame);
    });
  }

  async readBatch(tags: { tagId: string; address: string }[]): Promise<TagReadResult[]> {
    const out: TagReadResult[] = [];
    for (const t of tags) out.push(await this.readTag(t.tagId, t.address));
    return out;
  }

  async writeTag(tagId: string, address: string, value: number | boolean): Promise<TagWriteResult> {
    // Physical writes are not implemented: they need commissioning approval and an allowlist (spec 8.3).
    return {
      success: false,
      tagId,
      address,
      valueWritten: value,
      message: 'BLOCKED: writes to a physical PLC are disabled (read-only mode).',
      timestamp: new Date().toISOString(),
    };
  }

  /** TCP reachability only. Uses a throwaway socket and does NOT touch the session. */
  ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return new Promise((resolve) => {
      const start = Date.now();
      const sock = new net.Socket();
      const end = (success: boolean, message: string) => {
        sock.destroy();
        resolve({ success, latencyMs: Date.now() - start, message });
      };
      sock.setTimeout(this.config.timeoutMs);
      sock.once('connect', () => end(true, `TCP port ${this.config.port} reachable. This does not prove SLMP is configured; run Read Test.`));
      sock.once('timeout', () => end(false, `No TCP response from ${this.config.host}:${this.config.port}`));
      sock.once('error', (e) => end(false, `TCP error: ${e.message}`));
      sock.connect(this.config.port, this.config.host);
    });
  }
}
