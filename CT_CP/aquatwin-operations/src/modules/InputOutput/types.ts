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
  address: string; // Mitsubishi: "X0", "Y0", "D100", "M0"; Siemens: "%IW64", "%I0.0"
  addressNotation: 'OCTAL' | 'HEX' | 'DECIMAL' | 'IEC';
  signal: '4-20mA' | '0-10V' | '24VDC' | 'RELAY' | 'PT100' | 'TRANSISTOR';
  terminal: string; // e.g. "TB1:1-2"
  deviceName?: string; // e.g. "P101", "LT101", "XV101"
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
  slot: number; // 0 for CPU, 1..8 for slots
  name: string;
  model: string;
  type: 'CPU' | 'DI' | 'DO' | 'AI' | 'AO' | 'COMM' | 'TEMP' | 'POW';
  channelsCount: number;
  signalTypes: string[];
  status: 'HEALTHY' | 'WARNING' | 'ERROR';
  addressRange?: string; // e.g. "X0 - XF" or "D100 - D107"
  specs?: Record<string, string>;
}

export interface CatalogueModuleItem {
  model: string;
  name: string;
  manufacturer: 'Mitsubishi Electric';
  series: 'MELSEC iQ-R' | 'MELSEC iQ-F' | 'MELSEC Q';
  category:
    | 'CPU'
    | 'Power Supply'
    | 'Digital Input'
    | 'Digital Output'
    | 'Analog Input'
    | 'Analog Output'
    | 'Communication'
    | 'Temperature'
    | 'Special Function';
  channels: number;
  signalType: string;
  range?: string;
  currentConsumption5V: string;
  terminalType: string;
  description: string;
  supportedSlots?: string[];
}

export interface TerminalLogMessage {
  id: string;
  timestamp: string;
  type: 'CONNECTION' | 'VALUE' | 'OUTPUT' | 'DIAGNOSTIC' | 'SYSTEM' | 'COMMAND';
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  source: string;
  tagId?: string;
  text: string;
}

export interface PlcDeviceConfig {
  id: string;
  name: string;
  manufacturer: 'Mitsubishi Electric' | 'Siemens' | 'Schneider Electric' | 'Rockwell';
  family: 'iQ-R' | 'iQ-F' | 'iQ-L' | 'Q' | 'S7-1500' | 'S7-1200';
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
  batteryStatus: 'OK' | 'LOW' | 'ERROR';
  scanTimeMs: number;
  cpuLoadPercent: number;
  errorCode: string;
}

// Ladder Logic Types (GX Works3 Style)
export interface LadderContact {
  id: string;
  type: 'NO' | 'NC' | 'RISING' | 'FALLING';
  address: string; // e.g. "M0.0", "T0", "I0.0", "X0"
  label: string; // e.g. "Pump Run Enabled", "Timer T0"
  energized?: boolean;
}

export interface LadderCoil {
  id: string;
  type: 'COIL' | 'SET' | 'RESET' | 'TIMER' | 'BLOCK';
  address: string; // e.g. "Q0.0", "Y0", "T0"
  label: string; // e.g. "Pump 101 Command"
  param?: string; // e.g. "K100" (10.0 sec) or "D10"
  energized?: boolean;
}

export interface LadderRung {
  rungNumber: number;
  comment?: string;
  contacts: LadderContact[];
  coils: LadderCoil[];
  active: boolean;
}

export interface LadderProgram {
  id: string;
  name: string;
  description: string;
  rungs: LadderRung[];
}

// Ethernet Diagnostics Row (GX Works3 Style)
export interface EthernetDiagConnectionRow {
  connectionNo: number;
  functionName: string;
  hostPort: number;
  commMethod: string;
  destIp: string;
  destPort: number;
  latestErrorCode: string;
  protocol: string;
  openSystem: string;
  tcpStatus: 'Established' | 'Connecting' | 'Closed' | 'Listening';
  remotePasswordStatus: string;
}


