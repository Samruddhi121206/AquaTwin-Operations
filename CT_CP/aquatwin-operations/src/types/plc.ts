/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataQuality = 'GOOD' | 'UNCERTAIN' | 'BAD' | 'STALE' | 'SIMULATED';

export type PlcDataType = 'BOOL' | 'INT' | 'DINT' | 'REAL' | 'WORD' | 'DWORD';

export interface PlcTag {
  id: string; // e.g. "TK101.LEVEL", "P101.RUN_CMD"
  address: string; // e.g. "%IW64", "%Q0.0", "DB1.DBD0"
  description: string;
  dataType: PlcDataType;
  engUnit?: string; // "m", "m3/h", "bar", "%"
  rawRange?: [number, number]; // Siemens S7 analog: [0, 27648] or [5530, 27648] for 4-20mA
  engRange?: [number, number]; // e.g. [0.0, 5.0] m
  ioChannelId?: string; // e.g. "A3.AI0"
  writable: boolean; // allowable command target
  source: 'VIRTUAL' | 'REAL';
  verified: boolean; // true only when verified against site P&ID / electrical drawings
}

export interface PlcTagValue {
  tagId: string;
  address: string;
  value: number | boolean;
  rawCount?: number;
  quality: DataQuality;
  sourceTimestamp: string;
  serverTimestamp: string;
}

export interface PlcScanCycleMetrics {
  scanCycleMs: number; // e.g. 120 ms
  maxScanCycleMs: number;
  minScanCycleMs: number;
  cycleCounter: number;
  cpuLoadPercent: number;
  lastScanTimestamp: string;
}

export interface PlcHealth {
  connected: boolean;
  connectionState: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  mode: 'VIRTUAL' | 'REAL';
  protocol: 'VIRTUAL_SCAN' | 'OPC_UA' | 'MODBUS_TCP';
  ipAddress: string;
  rack: number;
  slot: number;
  firmware: string;
  lastHeartbeat: string;
  latencyMs: number;
  readOnly: boolean;
  activeAlarmsCount: number;
}

