/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataQuality } from '../../types/plc';

export type TagStatus = 'CONFIGURED' | 'VERIFIED' | 'UNAVAILABLE' | 'DISABLED';

export interface ExtendedPlcTag {
  id: string; // e.g. "TK101_LEVEL"
  name: string;
  description: string;
  moduleId: string; // e.g. "SLOT-1-AI"
  channelIndex: number;
  type: 'DI' | 'AI' | 'DO' | 'AO';
  address: string; // Mitsubishi: "D100:F", "X100"; Siemens: "%IW64", "%I0.0"
  addressNotation: 'OCTAL' | 'HEX' | 'DECIMAL' | 'IEC';
  signal: '4-20mA' | '0-10V' | '24VDC' | 'RELAY' | 'PT100';
  terminal: string; // "X1:14-15"
  scaling: {
    mode: 'LINEAR' | 'NONE';
    rawMin: number;
    rawMax: number;
    engMin: number;
    engMax: number;
    unit: string;
  };
  limits: {
    HH?: number;
    H?: number;
    L?: number;
    LL?: number;
  };
  currentValue: number | boolean | string;
  rawCounts?: number;
  quality: DataQuality;
  status: TagStatus;
  access: 'READ_ONLY' | 'WRITE_ALLOWED';
  lastVerified?: string | null;
  lastUpdate: string;
  forced?: boolean;
  fault?: 'WIRE_BREAK' | 'SHORT' | 'OVERRANGE' | 'UNDERRANGE' | null;
}

export interface PlcHardwareModule {
  id: string;
  slot: number;
  name: string;
  model: string;
  type: 'CPU' | 'DI' | 'DO' | 'AI' | 'AO' | 'COMM';
  channelsCount: number;
  signalTypes: string[];
  status: 'HEALTHY' | 'WARNING' | 'ERROR';
}

export interface TerminalLogMessage {
  id: string;
  timestamp: string;
  type: 'CONNECTION' | 'VALUE' | 'OUTPUT' | 'DIAGNOSTIC' | 'SYSTEM';
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  source: string;
  tagId?: string;
  text: string;
}

export interface PlcDeviceConfig {
  id: string;
  name: string;
  manufacturer: 'Mitsubishi Electric' | 'Siemens' | 'Schneider Electric' | 'Rockwell';
  family: 'iQ-F' | 'iQ-R' | 'iQ-L' | 'Q' | 'S7-1500' | 'S7-1200';
  cpuModel: string;
  protocol: 'SLMP_3E' | 'SLMP_4E' | 'OPC_UA' | 'MODBUS_TCP' | 'VIRTUAL_SCAN';
  host: string;
  port: number;
  pollIntervalMs: number;
  timeoutMs: number;
  dataCode: 'BINARY' | 'ASCII';
  firmware: string;
  mode: 'VIRTUAL' | 'REAL';
  readOnly: boolean;
}
