/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataQuality } from './plc';

export type IOChannelType = 'AI' | 'DI' | 'AO' | 'DO';
export type IOSignalType = '4-20mA' | '0-10V' | '24VDC' | 'RELAY' | 'PT100';
export type IOChannelFault = 'WIRE_BREAK' | 'SHORT' | 'OVERRANGE' | 'UNDERRANGE' | null;

export interface IOChannel {
  id: string; // e.g. "A3.AI0", "A4.DI0", "A6.DO0"
  moduleId: string; // e.g. "A3" (AI 8xU/I)
  moduleName: string; // e.g. "Siemens AI 8x13Bit"
  type: IOChannelType;
  channel: number; // 0 to 7 or 15
  address: string; // "%IW64", "%I0.0", etc.
  signal: IOSignalType;
  terminalId: string; // "X1:14-15"
  tagId: string; // "TK101.LEVEL"
  tagDescription: string;
  rawCount?: number; // Siemens counts (0 to 27648)
  scaledValue: number | boolean;
  engUnit?: string;
  quality: DataQuality;
  forced: boolean;
  forcedValue?: number | boolean;
  fault: IOChannelFault;
  lastUpdate: string;
}

export type SignalNodeKind =
  | 'FIELD_DEVICE'
  | 'FIELD_CABLE'
  | 'TERMINAL'
  | 'IO_CHANNEL'
  | 'PLC_TAG'
  | 'GATEWAY'
  | 'UI_OBJECT'
  | 'RELAY'
  | 'CONTACTOR'
  | 'ACTUATOR';

export interface SignalPathNode {
  kind: SignalNodeKind;
  refId: string;
  label: string;
  subtext?: string;
  status?: 'ok' | 'warning' | 'fault' | 'active';
  value?: string | number | boolean;
}

export interface SignalPath {
  id: string;
  equipmentId: string; // e.g. "LT-101", "P-101"
  name: string;
  description: string;
  signalType: IOSignalType;
  nodes: SignalPathNode[];
}

export interface PanelComponent {
  id: string; // "CALLOUT-1", "K9", "A3", "PSU1"
  calloutNumber?: number; // 1 to 25 corresponding to reference image
  name: string;
  manufacturer: string;
  model: string;
  kind:
    | 'ISOLATOR'
    | 'MCB'
    | 'MOTOR_PROTECTOR'
    | 'PSU_24V'
    | 'PLC_CPU'
    | 'AI_MODULE'
    | 'DI_MODULE'
    | 'AO_MODULE'
    | 'DO_MODULE'
    | 'RELAY'
    | 'CONTACTOR'
    | 'SAFETY_RELAY'
    | 'TERMINAL_BLOCK'
    | 'ETHERNET_SWITCH'
    | 'EARTH_BAR'
    | 'DRIVE'
    | 'HMI'
    | 'ESTOP'
    | 'PILOT_LIGHT'
    | 'FUSE_DISTRIBUTION'
    | 'SURGE_PROTECTION'
    | 'CABLE_LOOM';
  zone: 'Z1_PROTECTION' | 'Z2_SWITCHING_SAFETY' | 'Z3_CONTROLLER_POWER' | 'Z4_TERMINALS' | 'Z5_SIDE_DUCT' | 'Z6_DOOR';
  position: { x: number; y: number; w: number; h: number };
  linkedChannels: string[];
  linkedEquipment: string[];
  specs: Record<string, string>;
  status: 'active' | 'standby' | 'tripped' | 'off';
  verified: boolean; // false until real panel drawings supplied
}

