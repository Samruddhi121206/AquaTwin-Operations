/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  PlantTelemetry,
  EquipmentSpec,
  AlarmItem,
  WorkOrderItem,
  AuditLogEntry,
  WaterQualitySample,
  ModuleType,
  DigitalTwinScenario,
} from '../types/plant';

interface PlantContextType {
  telemetry: PlantTelemetry;
  activeModule: ModuleType;
  setActiveModule: (m: ModuleType) => void;
  // Theme state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Simulation controls
  isSimulating: boolean;
  toggleSimulation: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  resetSimulation: () => void;
  
  // Actuator controls
  setXv101Opening: (percent: number) => void;
  setXv101Auto: (auto: boolean) => void;
  togglePump: (tag: 'P-101' | 'P-201' | 'P-202') => void;
  setPumpSpeed: (tag: 'P-101' | 'P-201' | 'P-202', speed: number) => void;
  setRejectValve: (percent: number) => void;
  setDosingRate: (ppm: number) => void;
  setDistributionDemand: (flow: number) => void;
  
  // PID tuning for TK-101
  updateTk101Pid: (params: { setpoint?: number; kp?: number; ki?: number; kd?: number; enabled?: boolean }) => void;
  
  // Twin What-If Scenarios
  activeScenario: string;
  applyScenario: (scenarioId: string) => void;
  twinOverrides: Partial<DigitalTwinScenario>;
  setTwinOverride: (key: keyof DigitalTwinScenario, value: number) => void;

  // Equipment, Alarms, Maintenance, Audit
  equipmentList: EquipmentSpec[];
  updateEquipmentStatus: (tag: string, status: EquipmentSpec['status']) => void;
  alarms: AlarmItem[];
  acknowledgeAlarm: (id: string) => void;
  silenceAlarm: (id: string) => void;
  clearResolvedAlarms: () => void;
  workOrders: WorkOrderItem[];
  createWorkOrder: (order: Omit<WorkOrderItem, 'id' | 'createdDate'>) => void;
  updateWorkOrderStatus: (id: string, status: WorkOrderItem['status']) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  qualityHistory: WaterQualitySample[];
  productionHistory: { timestamp: string; permeateM3h: number; powerKw: number; recoveryPercent: number }[];
}

const INITIAL_TELEMETRY: PlantTelemetry = {
  tk101: {
    tag: 'TK-101',
    name: 'Raw Water Equalization Tank',
    capacityM3: 50.0,
    currentLevelM3: 36.8,
    currentLevelPercent: 73.6,
    inflowM3h: 18.2,
    outflowM3h: 18.0,
    lowAlarmPercent: 20.0,
    highAlarmPercent: 88.0,
    pidControlEnabled: true,
    pidSetpointPercent: 75.0,
    pidKp: 1.8,
    pidKi: 0.12,
    pidKd: 0.45,
    pidIntegral: 12.0,
    pidLastError: 1.4,
    pidOutput: 82.5,
  },
  tk201: {
    tag: 'TK-201',
    name: 'Treated Permeate Storage Tank',
    capacityM3: 35.0,
    currentLevelM3: 26.2,
    currentLevelPercent: 74.8,
    inflowM3h: 13.5,
    outflowM3h: 12.0,
    lowAlarmPercent: 15.0,
    highAlarmPercent: 92.0,
    pidControlEnabled: false,
    pidSetpointPercent: 80.0,
    pidKp: 1.5,
    pidKi: 0.1,
    pidKd: 0.3,
    pidIntegral: 0,
    pidLastError: 0,
    pidOutput: 0,
  },
  xv101_openingPercent: 82.5,
  xv101_auto: true,
  v201_rejectValvePercent: 35.0,
  xv202_flushValveOpen: false,

  p101_running: true,
  p101_speedPercent: 90.0,
  p101_flowM3h: 18.0,
  p101_pressureBar: 3.2,
  p101_powerKw: 4.8,

  p201_running: true,
  p201_speedPercent: 88.0,
  p201_flowM3h: 18.0,
  p201_pressureBar: 7.8,
  p201_powerKw: 9.6,

  p202_running: true,
  p202_speedPercent: 92.0,
  p202_flowM3h: 18.0,
  p202_pressureBar: 15.4,
  p202_powerKw: 21.2,

  str101_dpBar: 0.18,
  f201_dpBar: 0.38,
  f202_dpBar: 0.28,

  cd201_dosingPpm: 3.5,
  cd201_running: true,

  ro_feedFlowM3h: 18.0,
  ro_permeateFlowM3h: 13.5,
  ro_rejectFlowM3h: 4.5,
  ro_feedPressureBar: 15.4,
  ro_permeatePressureBar: 0.8,
  ro_rejectPressureBar: 14.1,
  ro_recoveryPercent: 75.0,
  ro_saltRejectionPercent: 98.6,
  ro_fluxLmh: 19.4,

  rawQuality: {
    timestamp: new Date().toLocaleTimeString(),
    location: 'raw',
    ph: 7.78,
    tdsMgL: 1420,
    conductivityUsCm: 2240,
    turbidityNtu: 3.2,
    temperatureC: 24.5,
    hardnessMgL: 380,
    freeChlorinePpm: 0.45,
    sdi: 3.8,
  },
  preRoQuality: {
    timestamp: new Date().toLocaleTimeString(),
    location: 'pre_ro',
    ph: 7.42,
    tdsMgL: 1410,
    conductivityUsCm: 2210,
    turbidityNtu: 0.18,
    temperatureC: 24.6,
    freeChlorinePpm: 0.02,
    sdi: 1.8,
  },
  permeateQuality: {
    timestamp: new Date().toLocaleTimeString(),
    location: 'permeate',
    ph: 6.85,
    tdsMgL: 26,
    conductivityUsCm: 42,
    turbidityNtu: 0.04,
    temperatureC: 24.8,
    hardnessMgL: 0.8,
  },
  rejectQuality: {
    timestamp: new Date().toLocaleTimeString(),
    location: 'reject',
    ph: 8.12,
    tdsMgL: 5540,
    conductivityUsCm: 8400,
    turbidityNtu: 0.65,
    temperatureC: 25.1,
  },

  totalPowerKw: 36.4,
  specificEnergyKwhM3: 2.70,
  dailyProductionM3: 218.4,
  dailyEnergyKwh: 589.6,
  plantEfficiencyPercent: 93.4,
  distributionDemandM3h: 12.0,
};

const INITIAL_EQUIPMENT: EquipmentSpec[] = [
  {
    tag: 'XV-101',
    name: 'Raw Water Source Pneumatic Valve',
    type: 'valve',
    stage: 'Pre-treatment',
    status: 'running',
    runtimeHours: 4820,
    healthScore: 98,
    manufacturer: 'Bray International',
    model: 'Series 92 Actuated Butterfly',
    commissionedDate: '2024-03-15',
    description: 'Modulating pneumatic inlet control valve regulating municipal/borewell intake into Raw Tank.',
    specs: { 'Diameter': 'DN100 (4")', 'Action': 'Fail-Closed (Air to Open)', 'Cv': '480', 'Rating': 'PN16' },
  },
  {
    tag: 'TK-101',
    name: 'Raw Water Equalization Tank',
    type: 'tank',
    stage: 'Pre-treatment',
    status: 'running',
    runtimeHours: 8760,
    healthScore: 99,
    manufacturer: 'Balmoral Tanks',
    model: 'GFS Cylindrical Equalizer 50',
    commissionedDate: '2024-01-10',
    description: 'Glass-fused-to-steel equalization tank with high/low ultrasonic transmitter and overflow baffle.',
    specs: { 'Total Capacity': '50 m³ (50,000 L)', 'Diameter': '3.8 m', 'Height': '4.5 m', 'Material': 'Epoxy Lined Steel' },
  },
  {
    tag: 'STR-101',
    name: 'Duplex Basket Strainer',
    type: 'strainer',
    stage: 'Pre-treatment',
    status: 'running',
    runtimeHours: 4820,
    healthScore: 94,
    manufacturer: 'Eaton Filtration',
    model: 'Model 53BTX Duplex',
    commissionedDate: '2024-03-15',
    description: 'Continuous flow duplex strainer with dual DP differential transmitter to catch macro grit.',
    specs: { 'Mesh Rating': '150 Mesh (100 µm)', 'Body': '316L SS', 'Max Flow': '40 m³/h', 'Max DP': '1.0 bar' },
  },
  {
    tag: 'P-101',
    name: 'Raw Water Feed Pump',
    type: 'pump',
    stage: 'Pre-treatment',
    status: 'running',
    powerKw: 4.8,
    flowM3h: 18.0,
    pressureBar: 3.2,
    tempC: 44.2,
    vibrationMms: 1.8,
    runtimeHours: 4120,
    healthScore: 95,
    manufacturer: 'Grundfos',
    model: 'NBG 65-40-200/180',
    commissionedDate: '2024-03-18',
    description: 'End-suction centrifugal transfer pump with VFD drive providing pressurized suction to RO trains.',
    specs: { 'Rated Power': '5.5 kW', 'Rated Head': '32 m', 'Speed': '1450 RPM', 'Impeller': 'Closed 316SS' },
  },
  {
    tag: 'P-201',
    name: 'RO Multi-Media Booster Pump',
    type: 'pump',
    stage: 'Filtration',
    status: 'running',
    powerKw: 9.6,
    flowM3h: 18.0,
    pressureBar: 7.8,
    tempC: 48.6,
    vibrationMms: 2.1,
    runtimeHours: 3950,
    healthScore: 92,
    manufacturer: 'Grundfos',
    model: 'CR 20-7 Vertical Multistage',
    commissionedDate: '2024-03-18',
    description: 'Inter-stage vertical inline pump overcoming micro-filtration pressure drop before HP pump.',
    specs: { 'Rated Power': '11 kW', 'Rated Flow': '20 m³/h', 'Speed': '2900 RPM', 'Stages': '7 Stage Inline' },
  },
  {
    tag: 'F-201',
    name: '5-Micron Cartridge Guard Filter',
    type: 'filter',
    stage: 'Filtration',
    status: 'running',
    runtimeHours: 850,
    healthScore: 89,
    manufacturer: 'Pall Water',
    model: 'Marksman Polypropylene Series',
    commissionedDate: '2024-09-01',
    description: 'Pre-RO guard filter housing with 7 pleated polypropylene elements preventing particulate fouling.',
    specs: { 'Rating': '5.0 µm absolute', 'Cartridge Count': '7 x 40"', 'Design DP': '0.35 bar', 'Trip DP': '1.2 bar' },
  },
  {
    tag: 'F-202',
    name: '1-Micron Polishing Filter',
    type: 'filter',
    stage: 'Filtration',
    status: 'running',
    runtimeHours: 850,
    healthScore: 91,
    manufacturer: 'Pall Water',
    model: 'Profile Coreless Micro-Filter',
    commissionedDate: '2024-09-01',
    description: 'Fine polishing barrier filter removing fine colloids to guarantee SDI15 < 2.5 prior to membranes.',
    specs: { 'Rating': '1.0 µm absolute', 'Cartridge Count': '7 x 40"', 'Design DP': '0.28 bar', 'Trip DP': '1.0 bar' },
  },
  {
    tag: 'CD-201',
    name: 'Antiscalant & Biocide Dosing Skid',
    type: 'dosing',
    stage: 'Filtration',
    status: 'running',
    runtimeHours: 4120,
    healthScore: 96,
    manufacturer: 'Milton Roy',
    model: 'mROY Series B Dosing Metering',
    commissionedDate: '2024-03-20',
    description: 'Precision solenoid diaphragm metering pump with proportional 4-20mA flow pacing injection.',
    specs: { 'Chemical': 'Phosphonate Polymeric Antiscalant', 'Stroke': '45%', 'Max Flow': '4.5 L/h', 'Accuracy': '±1%' },
  },
  {
    tag: 'P-202',
    name: 'High Pressure RO Feed Pump',
    type: 'pump',
    stage: 'High Pressure RO',
    status: 'running',
    powerKw: 21.2,
    flowM3h: 18.0,
    pressureBar: 15.4,
    tempC: 56.1,
    vibrationMms: 2.8,
    runtimeHours: 4110,
    healthScore: 94,
    manufacturer: 'Danfoss',
    model: 'APP 22 High Pressure Axial Piston',
    commissionedDate: '2024-03-22',
    description: 'High efficiency positive displacement axial piston pump overcoming osmotic pressure across RO-201.',
    specs: { 'Rated Power': '22 kW', 'Operating Press': '15.5 bar', 'Efficiency': '89%', 'Protection': 'Low Suction PSLL' },
  },
  {
    tag: 'RO-201',
    name: 'Reverse Osmosis Membrane Rack',
    type: 'membrane',
    stage: 'High Pressure RO',
    status: 'running',
    runtimeHours: 4110,
    healthScore: 91,
    manufacturer: 'DuPont FilmTec',
    model: 'BW30-400 High Rejection Elements',
    commissionedDate: '2024-03-22',
    description: '2:1 staged pressure vessel array housing 18 x 8-inch spiral-wound polyamide composite membranes.',
    specs: { 'Vessels': '3 (2 in Stage 1, 1 in Stage 2)', 'Elements': '18 x 8"x40"', 'Design Recovery': '75%', 'Salt Rejection': '>99.2%' },
  },
  {
    tag: 'TK-201',
    name: 'Treated Permeate Product Tank',
    type: 'tank',
    stage: 'Storage & Distribution',
    status: 'running',
    runtimeHours: 8760,
    healthScore: 99,
    manufacturer: 'Balmoral Tanks',
    model: 'Permeate Sanitary Buffer 35',
    commissionedDate: '2024-01-10',
    description: 'Food/Pharma grade 316L SS lined storage tank holding demineralized permeate for plant distribution.',
    specs: { 'Total Capacity': '35 m³ (35,000 L)', 'Vent Filter': '0.2 µm Hydrophobic', 'Level Sensor': 'Radar Transducer' },
  },
];

const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'ALM-101',
    tag: 'F-201',
    equipmentName: '5-Micron Guard Filter',
    message: 'Cartridge Differential Pressure approaching warning limit (0.38 bar / 0.50 bar)',
    severity: 'advisory',
    timestamp: '10:14:22',
    acknowledged: false,
    value: '0.38 bar',
    threshold: '0.50 bar',
    category: 'pressure',
  },
  {
    id: 'ALM-102',
    tag: 'RO-201',
    equipmentName: 'RO Membrane Rack',
    message: 'Recovery rate steady at 75.0% within nominal envelope',
    severity: 'advisory',
    timestamp: '09:45:00',
    acknowledged: true,
    acknowledgedBy: 'Lead Operator (R. Sharma)',
    acknowledgedAt: '09:50:12',
    value: '75.0%',
    threshold: '78.0%',
    category: 'flow',
  },
];

const INITIAL_WORK_ORDERS: WorkOrderItem[] = [
  {
    id: 'WO-2401',
    title: 'Replace F-201 Cartridge Filter Elements',
    equipmentTag: 'F-201',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'M. Chen (Mechanical)',
    createdDate: '2026-11-08',
    dueDate: '2026-11-14',
    type: 'preventive',
    description: 'Isolate filter housing, drain residual water, install 7 new Pall Marksman 5µm pleated elements, perform sanitize rinse.',
    estimatedHours: 3.5,
  },
  {
    id: 'WO-2402',
    title: 'Bi-Monthly P-202 Axial Bearing Vibration & Seal Inspection',
    equipmentTag: 'P-202',
    priority: 'low',
    status: 'open',
    assignedTo: 'A. Patel (Vibration Tech)',
    createdDate: '2026-11-10',
    dueDate: '2026-11-18',
    type: 'preventive',
    description: 'Collect FFT spectral vibration measurements on motor DE/NDE and pump bearing housing. Check flush line pressure.',
    estimatedHours: 2.0,
  },
  {
    id: 'WO-2403',
    title: 'Calibrate Pre-RO Conductivity Probe CT-201',
    equipmentTag: 'RO-201',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'D. Kumar (Instrumentation)',
    createdDate: '2026-11-04',
    dueDate: '2026-11-06',
    type: 'calibration',
    description: 'Perform standard 2-point reference calibration using 1,413 µS/cm and 10,000 µS/cm NIST certified buffer solutions.',
    estimatedHours: 1.5,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '11:02:15',
    user: 'Operator (S. Deshmukh)',
    role: 'Control Room Operator',
    action: 'SETPOINT_UPDATE',
    category: 'control',
    details: 'Adjusted TK-101 level PID setpoint from 72.0% to 75.0%',
  },
  {
    id: 'AUD-002',
    timestamp: '10:45:00',
    user: 'System Automator',
    role: 'PLC Watchdog',
    action: 'AUTO_BALANCING',
    category: 'simulation',
    details: 'RO Recovery calculated at 75.0%, rejecting 4.5 m³/h to brine line',
  },
  {
    id: 'AUD-003',
    timestamp: '09:50:12',
    user: 'R. Sharma',
    role: 'Lead Process Engineer',
    action: 'ALARM_ACK',
    category: 'alarm',
    details: 'Acknowledged Advisory Alarm ALM-102 (RO Recovery Nominal Check)',
  },
];

const PlantContext = createContext<PlantContextType | null>(null);

export const PlantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<PlantTelemetry>(INITIAL_TELEMETRY);
  const [activeModule, setActiveModule] = useState<ModuleType>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeScenario, setActiveScenario] = useState<string>('baseline');
  const [twinOverrides, setTwinOverrides] = useState<Partial<DigitalTwinScenario>>({});

  const [equipmentList, setEquipmentList] = useState<EquipmentSpec[]>(INITIAL_EQUIPMENT);
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>(INITIAL_WORK_ORDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Historical telemetry arrays for charts
  const [qualityHistory, setQualityHistory] = useState<WaterQualitySample[]>([
    { timestamp: '10:00', location: 'permeate', ph: 6.84, tdsMgL: 25, conductivityUsCm: 41, turbidityNtu: 0.04, temperatureC: 24.5 },
    { timestamp: '10:15', location: 'permeate', ph: 6.85, tdsMgL: 26, conductivityUsCm: 42, turbidityNtu: 0.04, temperatureC: 24.6 },
    { timestamp: '10:30', location: 'permeate', ph: 6.86, tdsMgL: 27, conductivityUsCm: 43, turbidityNtu: 0.05, temperatureC: 24.7 },
    { timestamp: '10:45', location: 'permeate', ph: 6.85, tdsMgL: 26, conductivityUsCm: 42, turbidityNtu: 0.04, temperatureC: 24.7 },
    { timestamp: '11:00', location: 'permeate', ph: 6.85, tdsMgL: 26, conductivityUsCm: 42, turbidityNtu: 0.04, temperatureC: 24.8 },
  ]);

  const [productionHistory, setProductionHistory] = useState([
    { timestamp: '06:00', permeateM3h: 13.4, powerKw: 36.1, recoveryPercent: 74.8 },
    { timestamp: '07:00', permeateM3h: 13.5, powerKw: 36.2, recoveryPercent: 75.0 },
    { timestamp: '08:00', permeateM3h: 13.6, powerKw: 36.5, recoveryPercent: 75.2 },
    { timestamp: '09:00', permeateM3h: 13.5, powerKw: 36.4, recoveryPercent: 75.0 },
    { timestamp: '10:00', permeateM3h: 13.5, powerKw: 36.4, recoveryPercent: 75.0 },
    { timestamp: '11:00', permeateM3h: 13.5, powerKw: 36.4, recoveryPercent: 75.0 },
  ]);

  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  // Toggle simulation
  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev);
    addAuditLog({
      user: 'Control Desk',
      role: 'System Operator',
      action: !isSimulating ? 'SIMULATION_RESUMED' : 'SIMULATION_PAUSED',
      category: 'simulation',
      details: !isSimulating ? 'Virtual plant time marching resumed.' : 'Plant simulation frozen in current state.',
    });
  };

  // Reset simulation to baseline
  const resetSimulation = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setActiveScenario('baseline');
    setTwinOverrides({});
    addAuditLog({
      user: 'Control Desk',
      role: 'Process Engineer',
      action: 'SIMULATION_RESET',
      category: 'simulation',
      details: 'All simulated parameters, tank levels, and setpoints restored to standard nominal baseline.',
    });
  };

  const addAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Actuator controls
  const setXv101Opening = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    setTelemetry((prev) => ({
      ...prev,
      xv101_openingPercent: clamped,
      xv101_auto: false,
    }));
    addAuditLog({
      user: 'Operator',
      role: 'Control Room',
      action: 'VALVE_MANUAL_SET',
      category: 'control',
      details: `XV-101 manual position adjusted to ${clamped.toFixed(1)}% (Auto PID bypassed)`,
    });
  };

  const setXv101Auto = (auto: boolean) => {
    setTelemetry((prev) => ({
      ...prev,
      xv101_auto: auto,
      tk101: { ...prev.tk101, pidControlEnabled: auto },
    }));
    addAuditLog({
      user: 'Operator',
      role: 'Control Room',
      action: 'PID_MODE_CHANGE',
      category: 'control',
      details: `TK-101 level control mode switched to ${auto ? 'AUTOMATIC (PID)' : 'MANUAL'}`,
    });
  };

  const togglePump = (tag: 'P-101' | 'P-201' | 'P-202') => {
    setTelemetry((prev) => {
      let updated = { ...prev };
      let newState = false;
      if (tag === 'P-101') {
        newState = !prev.p101_running;
        updated.p101_running = newState;
      } else if (tag === 'P-201') {
        newState = !prev.p201_running;
        updated.p201_running = newState;
      } else if (tag === 'P-202') {
        newState = !prev.p202_running;
        updated.p202_running = newState;
      }
      return updated;
    });

    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.tag === tag ? { ...eq, status: eq.status === 'running' ? 'standby' : 'running' } : eq
      )
    );

    addAuditLog({
      user: 'Operator',
      role: 'Control Room',
      action: 'PUMP_STATE_TOGGLE',
      category: 'control',
      details: `Equipment ${tag} switched state.`,
    });
  };

  const setPumpSpeed = (tag: 'P-101' | 'P-201' | 'P-202', speed: number) => {
    const clamped = Math.max(0, Math.min(100, speed));
    setTelemetry((prev) => {
      let updated = { ...prev };
      if (tag === 'P-101') updated.p101_speedPercent = clamped;
      if (tag === 'P-201') updated.p201_speedPercent = clamped;
      if (tag === 'P-202') updated.p202_speedPercent = clamped;
      return updated;
    });
  };

  const setRejectValve = (percent: number) => {
    const clamped = Math.max(10, Math.min(90, percent));
    setTelemetry((prev) => ({
      ...prev,
      v201_rejectValvePercent: clamped,
    }));
  };

  const setDosingRate = (ppm: number) => {
    const clamped = Math.max(0, Math.min(10, ppm));
    setTelemetry((prev) => ({
      ...prev,
      cd201_dosingPpm: clamped,
    }));
  };

  const setDistributionDemand = (flow: number) => {
    const clamped = Math.max(0, Math.min(30, flow));
    setTelemetry((prev) => ({
      ...prev,
      distributionDemandM3h: clamped,
      tk201: { ...prev.tk201, outflowM3h: clamped },
    }));
  };

  const updateTk101Pid = (params: { setpoint?: number; kp?: number; ki?: number; kd?: number; enabled?: boolean }) => {
    setTelemetry((prev) => {
      const current = prev.tk101;
      return {
        ...prev,
        xv101_auto: params.enabled ?? current.pidControlEnabled,
        tk101: {
          ...current,
          pidSetpointPercent: params.setpoint ?? current.pidSetpointPercent,
          pidKp: params.kp ?? current.pidKp,
          pidKi: params.ki ?? current.pidKi,
          pidKd: params.kd ?? current.pidKd,
          pidControlEnabled: params.enabled ?? current.pidControlEnabled,
        },
      };
    });
  };

  const setTwinOverride = (key: keyof DigitalTwinScenario, value: number) => {
    setTwinOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const applyScenario = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    let overrides: Partial<DigitalTwinScenario> = {};
    if (scenarioId === 'salinity_spike') {
      overrides = { feedTdsMultiplier: 1.8, chemicalDosingMultiplier: 1.4 };
    } else if (scenarioId === 'filter_fouling') {
      overrides = { f201FoulingFactor: 2.2, feedFlowOffset: -2.5 };
    } else if (scenarioId === 'pump_trip') {
      overrides = { p202PressureBoost: -6.0 };
      setTelemetry((prev) => ({ ...prev, p202_running: false }));
    } else if (scenarioId === 'high_recovery') {
      overrides = { p202PressureBoost: 2.0, feedFlowOffset: 2.0 };
      setRejectValve(25.0); // throttled reject increases recovery
    } else {
      overrides = {};
    }
    setTwinOverrides(overrides);

    addAuditLog({
      user: 'Digital Twin Engine',
      role: 'Simulation Core',
      action: 'SCENARIO_LOADED',
      category: 'simulation',
      details: `Applied twin scenario: "${scenarioId.toUpperCase()}". Operating dynamics adjusted.`,
    });
  };

  const updateEquipmentStatus = (tag: string, status: EquipmentSpec['status']) => {
    setEquipmentList((prev) =>
      prev.map((eq) => (eq.tag === tag ? { ...eq, status } : eq))
    );
    addAuditLog({
      user: 'Supervisor',
      role: 'Operations',
      action: 'EQUIPMENT_STATUS_CHANGE',
      category: 'maintenance',
      details: `Equipment ${tag} status manually set to ${status.toUpperCase()}`,
    });
  };

  const acknowledgeAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((alm) =>
        alm.id === id
          ? {
              ...alm,
              acknowledged: true,
              acknowledgedBy: 'Current Operator (Shift B)',
              acknowledgedAt: new Date().toLocaleTimeString(),
            }
          : alm
      )
    );
    addAuditLog({
      user: 'Shift Operator',
      role: 'Control Room',
      action: 'ALARM_ACKNOWLEDGED',
      category: 'alarm',
      details: `Acknowledged alarm event ${id}`,
    });
  };

  const silenceAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    addAuditLog({
      user: 'Shift Operator',
      role: 'Control Room',
      action: 'ALARM_SILENCED',
      category: 'alarm',
      details: `Silenced and archived alarm ${id}`,
    });
  };

  const clearResolvedAlarms = () => {
    setAlarms((prev) => prev.filter((a) => !a.acknowledged));
  };

  const createWorkOrder = (order: Omit<WorkOrderItem, 'id' | 'createdDate'>) => {
    const newOrder: WorkOrderItem = {
      ...order,
      id: `WO-${Date.now().toString().slice(-4)}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setWorkOrders((prev) => [newOrder, ...prev]);
    addAuditLog({
      user: 'Maintenance Planner',
      role: 'ERP Plant Asset',
      action: 'WORK_ORDER_CREATED',
      category: 'maintenance',
      details: `Created Work Order ${newOrder.id} for tag ${newOrder.equipmentTag} (${newOrder.priority})`,
    });
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrderItem['status']) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w))
    );
    addAuditLog({
      user: 'Technician',
      role: 'Maintenance Field',
      action: 'WORK_ORDER_STATUS',
      category: 'maintenance',
      details: `Updated Work Order ${id} status to ${status.toUpperCase()}`,
    });
  };

  // Continuous Simulation Physics Loop (every 1 second)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const dt = 1.0 * simulationSpeed; // time step scale (seconds equivalent)

        // 1. Noise generator for micro-fluctuations (subtle industrial sensor jitter ±0.2%)
        const jitter = (range: number) => (Math.random() - 0.5) * range;

        // 2. Twin Scenarios influences
        const tdsMult = twinOverrides.feedTdsMultiplier ?? 1.0;
        const foulingFactor = twinOverrides.f201FoulingFactor ?? 1.0;
        const pressBoost = twinOverrides.p202PressureBoost ?? 0.0;
        const flowOffset = twinOverrides.feedFlowOffset ?? 0.0;

        // 3. Raw Water Feed & Pump P-101 Flow
        let p101Flow = 0;
        let p101Power = 0;
        let p101Press = 0;
        if (prev.p101_running && prev.tk101.currentLevelM3 > 1.5) {
          // Normal nominal flow at 100% speed is 20 m3/h
          p101Flow = Math.max(0, (20.0 * (prev.p101_speedPercent / 100) + flowOffset + jitter(0.2)));
          p101Press = 3.2 * (prev.p101_speedPercent / 100) + jitter(0.05);
          p101Power = 4.8 * Math.pow(prev.p101_speedPercent / 100, 2.5);
        }

        // 4. Differential pressures across strainer & filters
        const strDp = Math.max(0.05, 0.18 * (p101Flow / 18.0) + jitter(0.01));
        const f201Dp = Math.max(0.1, (0.35 * foulingFactor * (p101Flow / 18.0)) + jitter(0.02));
        const f202Dp = Math.max(0.08, 0.28 * (p101Flow / 18.0) + jitter(0.01));

        // 5. Booster Pump P-201
        let p201Flow = 0;
        let p201Press = 0;
        let p201Power = 0;
        if (prev.p201_running && p101Flow > 2.0) {
          p201Flow = p101Flow;
          p201Press = (p101Press - (strDp + f201Dp + f202Dp)) + 5.2 * (prev.p201_speedPercent / 100);
          p201Power = 9.5 * Math.pow(prev.p201_speedPercent / 100, 2.5);
        }

        // 6. High Pressure Pump P-202 & Reverse Osmosis Feed
        let roFeedFlow = 0;
        let roFeedPress = 0;
        let p202Power = 0;
        if (prev.p202_running && p201Flow > 2.0) {
          roFeedFlow = p201Flow;
          roFeedPress = Math.max(4.0, (15.4 + pressBoost) * (prev.p202_speedPercent / 100) + jitter(0.1));
          p202Power = 21.2 * Math.pow(prev.p202_speedPercent / 100, 2.8);
        } else if (p201Flow > 2.0) {
          // P-202 off but upstream booster pushing through
          roFeedFlow = p201Flow * 0.4;
          roFeedPress = Math.max(1.5, p201Press * 0.5);
        }

        // 7. RO Mass Balance & Recovery Calculations
        // Recovery depends on feed pressure, reject throttling valve, and fouling
        // V201 throttling %: lower valve opening % = higher backpressure = higher recovery
        const rejectValveCoeff = (100 - prev.v201_rejectValvePercent) / 100; // 0.1 to 0.9
        let baseRecovery = 0.75;
        if (roFeedPress > 10.0) {
          baseRecovery = 0.60 + 0.22 * (rejectValveCoeff) + 0.01 * (roFeedPress - 15.0);
        } else {
          baseRecovery = Math.max(0.1, 0.04 * roFeedPress);
        }
        const recoveryClamped = Math.max(0.15, Math.min(0.85, baseRecovery));
        
        const roPermeateFlow = Math.max(0, roFeedFlow * recoveryClamped);
        const roRejectFlow = Math.max(0, roFeedFlow - roPermeateFlow); // Strict Mass Balance: Qf = Qp + Qr!
        const roRecoveryPercent = roFeedFlow > 0.1 ? (roPermeateFlow / roFeedFlow) * 100 : 0;
        const roRejectPress = Math.max(0.5, roFeedPress * 0.92 - jitter(0.1));
        const roPermeatePress = 0.8 + jitter(0.04);

        // 8. Water Quality Calculations
        // Raw quality
        const rawTds = Math.round(1420 * tdsMult + jitter(10));
        const rawConductivity = Math.round(rawTds * 1.58);
        const rawTurbidity = Number((3.2 + jitter(0.15)).toFixed(2));
        const rawPh = Number((7.78 + jitter(0.05)).toFixed(2));

        // Pre-RO quality (after chemical dosing and cartridge filtration)
        const preRoTurbidity = Number((Math.max(0.05, 0.18 * foulingFactor + jitter(0.02))).toFixed(2));
        const preRoSdi = Number((Math.max(1.0, 1.8 * foulingFactor + jitter(0.05))).toFixed(1));

        // Permeate quality: Salt rejection ~ 98.6%
        let saltRejection = 0.986;
        if (foulingFactor > 1.8) saltRejection = 0.975;
        const permeateTds = Math.round(Math.max(12, rawTds * (1 - saltRejection)));
        const permeateConductivity = Math.round(permeateTds * 1.62);
        const permeatePh = Number((6.85 + jitter(0.04)).toFixed(2));

        // Reject quality: Solute mass balance Cf*Qf = Cp*Qp + Cr*Qr -> Cr = (Cf*Qf - Cp*Qp) / Qr
        let rejectTds = 5500;
        if (roRejectFlow > 0.1) {
          rejectTds = Math.round(Math.max(rawTds, (rawTds * roFeedFlow - permeateTds * roPermeateFlow) / roRejectFlow));
        }
        const rejectConductivity = Math.round(rejectTds * 1.52);

        // 9. Dynamic Tank 101 PID Level Control & Mass Balance
        // If Auto: compute PID output for XV-101 inlet valve
        let currentXv101 = prev.xv101_openingPercent;
        let tk101Integral = prev.tk101.pidIntegral;
        let tk101LastError = prev.tk101.pidLastError;
        let pidOutput = prev.tk101.pidOutput;

        if (prev.xv101_auto && prev.tk101.pidControlEnabled) {
          const error = prev.tk101.pidSetpointPercent - prev.tk101.currentLevelPercent;
          const pTerm = prev.tk101.pidKp * error;
          tk101Integral = Math.max(-50, Math.min(50, tk101Integral + prev.tk101.pidKi * error * (dt / 10)));
          const dTerm = prev.tk101.pidKd * (error - tk101LastError) / (dt / 10);
          tk101LastError = error;

          pidOutput = Math.max(0, Math.min(100, 75 + pTerm + tk101Integral + dTerm));
          currentXv101 = pidOutput;
        }

        // TK-101 Inflow from supply line (nominal 22 m3/h at 100% opening)
        const tk101Inflow = (22.0 * (currentXv101 / 100)) + jitter(0.1);
        const tk101Outflow = p101Flow;
        // Mass balance in m3: dV = (Qin - Qout) * (dt / 3600 hours)
        // Scaled so virtual simulation moves visibly
        const tk101DeltaV = ((tk101Inflow - tk101Outflow) / 3600) * dt * 40;
        const newTk101M3 = Math.max(0.5, Math.min(prev.tk101.capacityM3, prev.tk101.currentLevelM3 + tk101DeltaV));
        const newTk101Percent = (newTk101M3 / prev.tk101.capacityM3) * 100;

        // 10. Dynamic Tank 201 Permeate Storage Mass Balance
        const tk201Inflow = roPermeateFlow;
        const tk201Outflow = prev.distributionDemandM3h;
        const tk201DeltaV = ((tk201Inflow - tk201Outflow) / 3600) * dt * 40;
        const newTk201M3 = Math.max(0.2, Math.min(prev.tk201.capacityM3, prev.tk201.currentLevelM3 + tk201DeltaV));
        const newTk201Percent = (newTk201M3 / prev.tk201.capacityM3) * 100;

        // 11. Energy & Power totals
        const totalPower = (p101Power + p201Power + p202Power + 0.8) + jitter(0.2); // + auxiliaries/dosing
        const specificEnergy = roPermeateFlow > 0.5 ? Number((totalPower / roPermeateFlow).toFixed(2)) : 0;
        const dailyProdDelta = (roPermeateFlow / 3600) * dt * 40;
        const dailyEnergyDelta = (totalPower / 3600) * dt * 40;

        return {
          ...prev,
          xv101_openingPercent: currentXv101,
          tk101: {
            ...prev.tk101,
            currentLevelM3: Number(newTk101M3.toFixed(2)),
            currentLevelPercent: Number(newTk101Percent.toFixed(1)),
            inflowM3h: Number(tk101Inflow.toFixed(1)),
            outflowM3h: Number(tk101Outflow.toFixed(1)),
            pidIntegral: tk101Integral,
            pidLastError: tk101LastError,
            pidOutput: Number(pidOutput.toFixed(1)),
          },
          tk201: {
            ...prev.tk201,
            currentLevelM3: Number(newTk201M3.toFixed(2)),
            currentLevelPercent: Number(newTk201Percent.toFixed(1)),
            inflowM3h: Number(tk201Inflow.toFixed(1)),
            outflowM3h: Number(tk201Outflow.toFixed(1)),
          },
          p101_flowM3h: Number(p101Flow.toFixed(1)),
          p101_pressureBar: Number(p101Press.toFixed(2)),
          p101_powerKw: Number(p101Power.toFixed(1)),

          p201_flowM3h: Number(p201Flow.toFixed(1)),
          p201_pressureBar: Number(p201Press.toFixed(2)),
          p201_powerKw: Number(p201Power.toFixed(1)),

          p202_flowM3h: Number(roFeedFlow.toFixed(1)),
          p202_pressureBar: Number(roFeedPress.toFixed(2)),
          p202_powerKw: Number(p202Power.toFixed(1)),

          str101_dpBar: Number(strDp.toFixed(2)),
          f201_dpBar: Number(f201Dp.toFixed(2)),
          f202_dpBar: Number(f202Dp.toFixed(2)),

          ro_feedFlowM3h: Number(roFeedFlow.toFixed(1)),
          ro_permeateFlowM3h: Number(roPermeateFlow.toFixed(1)),
          ro_rejectFlowM3h: Number(roRejectFlow.toFixed(1)),
          ro_feedPressureBar: Number(roFeedPress.toFixed(2)),
          ro_permeatePressureBar: Number(roPermeatePress.toFixed(2)),
          ro_rejectPressureBar: Number(roRejectPress.toFixed(2)),
          ro_recoveryPercent: Number(roRecoveryPercent.toFixed(1)),
          ro_saltRejectionPercent: Number((saltRejection * 100).toFixed(1)),
          ro_fluxLmh: Number((roPermeateFlow > 0 ? 19.4 * (roPermeateFlow / 13.5) : 0).toFixed(1)),

          rawQuality: {
            ...prev.rawQuality,
            timestamp: new Date().toLocaleTimeString(),
            tdsMgL: rawTds,
            conductivityUsCm: rawConductivity,
            turbidityNtu: rawTurbidity,
            ph: rawPh,
          },
          preRoQuality: {
            ...prev.preRoQuality,
            timestamp: new Date().toLocaleTimeString(),
            turbidityNtu: preRoTurbidity,
            sdi: preRoSdi,
          },
          permeateQuality: {
            ...prev.permeateQuality,
            timestamp: new Date().toLocaleTimeString(),
            tdsMgL: permeateTds,
            conductivityUsCm: permeateConductivity,
            ph: permeatePh,
          },
          rejectQuality: {
            ...prev.rejectQuality,
            timestamp: new Date().toLocaleTimeString(),
            tdsMgL: rejectTds,
            conductivityUsCm: rejectConductivity,
          },

          totalPowerKw: Number(totalPower.toFixed(1)),
          specificEnergyKwhM3: specificEnergy,
          dailyProductionM3: Number((prev.dailyProductionM3 + dailyProdDelta).toFixed(1)),
          dailyEnergyKwh: Number((prev.dailyEnergyKwh + dailyEnergyDelta).toFixed(1)),
          plantEfficiencyPercent: Number((93.4 + jitter(0.2)).toFixed(1)),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, twinOverrides]);

  // Periodic alarm condition watchdog
  useEffect(() => {
    if (!isSimulating) return;

    const t = telemetry;
    const newAlarms: AlarmItem[] = [];

    // F-201 high DP alarm
    if (t.f201_dpBar >= 0.7) {
      if (!alarms.some((a) => a.tag === 'F-201' && a.severity === 'critical')) {
        newAlarms.push({
          id: `ALM-${Date.now().toString().slice(-4)}`,
          tag: 'F-201',
          equipmentName: '5-Micron Guard Filter',
          message: `CRITICAL: Cartridge DP exceeded emergency threshold (${t.f201_dpBar} bar >= 0.70 bar)`,
          severity: 'critical',
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: false,
          value: `${t.f201_dpBar} bar`,
          threshold: '0.70 bar',
          category: 'pressure',
        });
      }
    }

    // TK-101 Low Level
    if (t.tk101.currentLevelPercent <= 20.0) {
      if (!alarms.some((a) => a.tag === 'TK-101' && a.category === 'level')) {
        newAlarms.push({
          id: `ALM-${Date.now().toString().slice(-4)}`,
          tag: 'TK-101',
          equipmentName: 'Raw Water Tank',
          message: `WARNING: Low tank level (${t.tk101.currentLevelPercent}%). Risk of feed pump suction cavitation.`,
          severity: 'warning',
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: false,
          value: `${t.tk101.currentLevelPercent}%`,
          threshold: '20.0%',
          category: 'level',
        });
      }
    }

    // Permeate TDS High
    if (t.permeateQuality.tdsMgL > 45) {
      if (!alarms.some((a) => a.tag === 'RO-201' && a.category === 'quality')) {
        newAlarms.push({
          id: `ALM-${Date.now().toString().slice(-4)}`,
          tag: 'RO-201',
          equipmentName: 'RO Membrane Rack',
          message: `WARNING: Permeate TDS breakthrough (${t.permeateQuality.tdsMgL} mg/L > 45 mg/L)`,
          severity: 'warning',
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: false,
          value: `${t.permeateQuality.tdsMgL} mg/L`,
          threshold: '45 mg/L',
          category: 'quality',
        });
      }
    }

    if (newAlarms.length > 0) {
      setAlarms((prev) => [...newAlarms, ...prev]);
    }
  }, [telemetry.f201_dpBar, telemetry.tk101.currentLevelPercent, telemetry.permeateQuality.tdsMgL, isSimulating]);

  // Periodic quality history updates
  useEffect(() => {
    const historyInterval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setQualityHistory((prev) => [
        ...prev.slice(-19),
        {
          timestamp: now,
          location: 'permeate',
          ph: telemetry.permeateQuality.ph,
          tdsMgL: telemetry.permeateQuality.tdsMgL,
          conductivityUsCm: telemetry.permeateQuality.conductivityUsCm,
          turbidityNtu: telemetry.permeateQuality.turbidityNtu,
          temperatureC: telemetry.permeateQuality.temperatureC,
        },
      ]);

      setProductionHistory((prev) => [
        ...prev.slice(-11),
        {
          timestamp: now,
          permeateM3h: telemetry.ro_permeateFlowM3h,
          powerKw: telemetry.totalPowerKw,
          recoveryPercent: telemetry.ro_recoveryPercent,
        },
      ]);
    }, 5000);

    return () => clearInterval(historyInterval);
  }, [telemetry.permeateQuality, telemetry.ro_permeateFlowM3h, telemetry.totalPowerKw, telemetry.ro_recoveryPercent]);

  return (
    <PlantContext.Provider
      value={{
        telemetry,
        activeModule,
        setActiveModule,
        theme,
        toggleTheme,
        isSimulating,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        resetSimulation,
        setXv101Opening,
        setXv101Auto,
        togglePump,
        setPumpSpeed,
        setRejectValve,
        setDosingRate,
        setDistributionDemand,
        updateTk101Pid,
        activeScenario,
        applyScenario,
        twinOverrides,
        setTwinOverride,
        equipmentList,
        updateEquipmentStatus,
        alarms,
        acknowledgeAlarm,
        silenceAlarm,
        clearResolvedAlarms,
        workOrders,
        createWorkOrder,
        updateWorkOrderStatus,
        auditLogs,
        addAuditLog,
        qualityHistory,
        productionHistory,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};
