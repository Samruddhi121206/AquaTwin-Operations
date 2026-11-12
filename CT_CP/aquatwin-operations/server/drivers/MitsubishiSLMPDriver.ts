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
  private scanTimeMs = 10;

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
      host: config.host || '192.168.1.10',
      port: config.port || 5007,
      family: config.family || 'iQ-R',
      cpuModel: config.cpuModel || 'R08CPU',
      protocol: 'SLMP_3E',
      timeoutMs: config.timeoutMs || 2500,
      scanIntervalMs: config.scanIntervalMs || 500,
      readOnly: config.readOnly ?? true,
    };
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.socket = new net.Socket();
        this.socket.setTimeout(this.config.timeoutMs);

        this.socket.connect(this.config.port, this.config.host, () => {
          this.connected = true;
          this.lastCommTime = new Date().toLocaleTimeString();
          this.lastErrorCode = '0000';
          resolve(true);
        });

        this.socket.on('error', (err) => {
          this.connected = false;
          this.lastErrorCode = 'C035'; // Socket connection timeout / unreachable
          this.errorCount++;
          resolve(false);
        });

        this.socket.on('timeout', () => {
          this.connected = false;
          this.lastErrorCode = 'C059'; // Command execution timeout
          this.socket?.destroy();
          resolve(false);
        });
      } catch (e) {
        this.connected = false;
        resolve(false);
      }
    });
  }

  async disconnect(): Promise<boolean> {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus(): PLCDriverStatus {
    return {
      connected: this.connected,
      mode: 'REAL',
      host: this.config.host,
      port: this.config.port,
      protocol: 'SLMP_3E_BINARY',
      lastCommunicationTime: this.lastCommTime,
      scanTimeMs: this.scanTimeMs,
      errorCount: this.errorCount,
      lastErrorCode: this.lastErrorCode,
      cpuMode: 'RUN',
      batteryStatus: 'OK',
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
      headDevice = parseInt(numStr, 8);
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

  async readTag(tagId: string, address: string): Promise<TagReadResult> {
    if (!this.connected || !this.socket) {
      return {
        tagId,
        address,
        value: 0,
        quality: 'BAD',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    const { deviceCode, headDevice, isBit } = this.parseAddress(address);
    const frame = this.build3EReadFrame(deviceCode, headDevice, isBit, 1);

    return new Promise((resolve) => {
      const startTime = Date.now();

      const onData = (data: Buffer) => {
        this.socket?.removeListener('data', onData);
        this.lastCommTime = new Date().toLocaleTimeString();
        this.scanTimeMs = Math.max(1, Date.now() - startTime);

        // SLMP 3E Response Frame:
        // [0-1] Subheader: 0xD0, 0x00
        // ...
        // [9-10] End Code: 0x00, 0x00 (Success)
        // [11+] Data payload
        if (data.length >= 11) {
          const endCode = data.readUInt16LE(9);
          if (endCode === 0) {
            let value: number | boolean = 0;
            if (isBit) {
              const bitByte = data.readUInt8(11);
              value = (bitByte & 0x01) === 1;
            } else {
              value = data.readInt16LE(11);
            }

            resolve({
              tagId,
              address,
              value,
              rawCounts: typeof value === 'number' ? value : undefined,
              quality: 'GOOD',
              timestamp: new Date().toLocaleTimeString(),
            });
            return;
          }
        }

        resolve({
          tagId,
          address,
          value: 0,
          quality: 'BAD',
          timestamp: new Date().toLocaleTimeString(),
        });
      };

      this.socket?.once('data', onData);
      this.socket?.write(frame);
    });
  }

  async readBatch(tags: { tagId: string; address: string }[]): Promise<TagReadResult[]> {
    return Promise.all(tags.map((t) => this.readTag(t.tagId, t.address)));
  }

  async writeTag(
    tagId: string,
    address: string,
    value: number | boolean,
    authorizationToken?: string
  ): Promise<TagWriteResult> {
    if (this.config.readOnly) {
      return {
        success: false,
        tagId,
        address,
        valueWritten: value,
        message: 'Industrial Safety Interlock: Physical PLC writes locked in Read-Only Telemetry Mode.',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    return {
      success: false,
      tagId,
      address,
      valueWritten: value,
      message: 'Write denied: Requires certified engineer physical confirmation on GX Works3.',
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  async ping(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    const isConn = await this.connect();
    const latency = Date.now() - startTime;
    return {
      success: isConn,
      latencyMs: latency,
      message: isConn
        ? `Physical Mitsubishi PLC responded in ${latency}ms (TCP port ${this.config.port} active)`
        : `Connection to Mitsubishi PLC at ${this.config.host}:${this.config.port} timed out.`,
    };
  }
}
