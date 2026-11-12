/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AquaTwin Industrial PLC Backend Gateway - Types
 */

export type PLCFamily = 'iQ-R' | 'iQ-F' | 'Q' | 'L' | 'FX5';
export type PLCProtocol = 'SLMP_3E' | 'SLMP_4E' | 'MC_PROTOCOL' | 'MODBUS_TCP';
export type RuntimeMode = 'VIRTUAL' | 'REAL';

export interface PLCConnectionConfig {
  host: string;
  port: number;
  family: PLCFamily;
  cpuModel: string;
  protocol: PLCProtocol;
  timeoutMs: number;
  scanIntervalMs: number;
  readOnly: boolean;
}

export interface PLCDriverStatus {
  connected: boolean;
  mode: RuntimeMode;
  host: string;
  port: number;
  protocol: string;
  lastCommunicationTime: string | null;
  scanTimeMs: number;
  errorCount: number;
  lastErrorCode: string;
  cpuMode: 'RUN' | 'STOP' | 'PAUSE';
  batteryStatus: 'OK' | 'LOW';
}

export interface TagReadResult {
  tagId: string;
  address: string;
  value: number | boolean | string;
  rawCounts?: number;
  quality: 'GOOD' | 'BAD' | 'UNCERTAIN' | 'SIMULATED';
  timestamp: string;
}

export interface TagWriteResult {
  success: boolean;
  tagId: string;
  address: string;
  valueWritten: number | boolean | string;
  confirmedFeedback?: boolean;
  message: string;
  timestamp: string;
}
