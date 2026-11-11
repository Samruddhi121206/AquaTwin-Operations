/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModuleType =
  | 'dashboard'
  | 'operations'
  | 'twin'
  | 'equipment'
  | 'alarms'
  | 'maintenance'
  | 'water_quality'
  | 'energy'
  | 'reports'
  | 'settings';

export type EquipmentStatus = 'running' | 'standby' | 'warning' | 'tripped' | 'maintenance';

export type AlarmSeverity = 'critical' | 'warning' | 'advisory';

export interface AlarmItem {
  id: string;
  tag: string;
  equipmentName: string;
  message: string;
  severity: AlarmSeverity;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  value: string;
  threshold: string;
  category: 'pressure' | 'level' | 'quality' | 'flow' | 'electrical';
}

export interface EquipmentSpec {
  tag: string;
  name: string;
  type: 'pump' | 'tank' | 'valve' | 'filter' | 'membrane' | 'dosing' | 'strainer';
  stage: 'Pre-treatment' | 'Filtration' | 'High Pressure RO' | 'Storage & Distribution';
  status: EquipmentStatus;
  powerKw?: number;
  flowM3h?: number;
  pressureBar?: number;
  tempC?: number;
  vibrationMms?: number;
  runtimeHours: number;
  healthScore: number; // 0-100%
  manufacturer: string;
  model: string;
  commissionedDate: string;
  description: string;
  specs: Record<string, string>;
}

export interface TankState {
  tag: string;
  name: string;
  capacityM3: number;
  currentLevelM3: number;
  currentLevelPercent: number;
  inflowM3h: number;
  outflowM3h: number;
  lowAlarmPercent: number;
  highAlarmPercent: number;
  pidControlEnabled: boolean;
  pidSetpointPercent: number;
  pidKp: number;
  pidKi: number;
  pidKd: number;
  pidIntegral: number;
  pidLastError: number;
  pidOutput: number; // 0 to 100% valve position
}

export interface WaterQualitySample {
  timestamp: string;
  location: 'raw' | 'pre_ro' | 'permeate' | 'reject';
  ph: number;
  tdsMgL: number;
  conductivityUsCm: number;
  turbidityNtu: number;
  temperatureC: number;
  hardnessMgL?: number;
  freeChlorinePpm?: number;
  sdi?: number;
}

export interface WorkOrderItem {
  id: string;
  title: string;
  equipmentTag: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'review' | 'completed';
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  type: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  description: string;
  estimatedHours: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'control' | 'alarm' | 'config' | 'maintenance' | 'simulation';
  details: string;
}

export interface PlantTelemetry {
  // Tank 101: Raw Water Storage
  tk101: TankState;
  // Tank 201: Permeate Product Storage
  tk201: TankState;
  
  // Actuated Valves
  xv101_openingPercent: number; // Raw inlet
  xv101_auto: boolean;
  v201_rejectValvePercent: number; // Reject throttling
  xv202_flushValveOpen: boolean;

  // Pumps state
  p101_running: boolean;
  p101_speedPercent: number;
  p101_flowM3h: number;
  p101_pressureBar: number;
  p101_powerKw: number;

  p201_running: boolean;
  p201_speedPercent: number;
  p201_flowM3h: number;
  p201_pressureBar: number;
  p201_powerKw: number;

  p202_running: boolean;
  p202_speedPercent: number;
  p202_flowM3h: number;
  p202_pressureBar: number;
  p202_powerKw: number;

  // Strainer & Filters
  str101_dpBar: number;
  f201_dpBar: number;
  f202_dpBar: number;

  // Dosing
  cd201_dosingPpm: number;
  cd201_running: boolean;

  // RO Module RO-201
  ro_feedFlowM3h: number;
  ro_permeateFlowM3h: number;
  ro_rejectFlowM3h: number;
  ro_feedPressureBar: number;
  ro_permeatePressureBar: number;
  ro_rejectPressureBar: number;
  ro_recoveryPercent: number;
  ro_saltRejectionPercent: number;
  ro_fluxLmh: number;

  // Water Quality Points
  rawQuality: WaterQualitySample;
  preRoQuality: WaterQualitySample;
  permeateQuality: WaterQualitySample;
  rejectQuality: WaterQualitySample;

  // Power & Energy
  totalPowerKw: number;
  specificEnergyKwhM3: number;
  dailyProductionM3: number;
  dailyEnergyKwh: number;
  plantEfficiencyPercent: number;

  // Distribution
  distributionDemandM3h: number;
}

export interface DigitalTwinScenario {
  id: string;
  name: string;
  description: string;
  feedTdsMultiplier: number;
  f201FoulingFactor: number;
  p202PressureBoost: number;
  chemicalDosingMultiplier: number;
  feedFlowOffset: number;
}
