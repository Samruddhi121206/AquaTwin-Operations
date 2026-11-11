/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRuntimeMode } from '../../context/RuntimeModeContext';
import { usePlant } from '../../context/PlantContext';
import { ModeBanner } from '../../components/shared/ModeBanner';
import { SimulatedBadge } from '../../components/shared/SimulatedBadge';
import { QualityIcon } from '../../components/shared/QualityIcon';
import {
  Cpu,
  Radio,
  Server,
  Activity,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  SlidersHorizontal,
  Search,
  Lock,
  Unlock,
} from 'lucide-react';

interface IOChannelItem {
  tag: string;
  type: 'DI' | 'AI' | 'DO' | 'AO';
  address: string;
  description: string;
  currentValue: string;
  state: 'Active' | 'Normal' | 'Tripped' | 'Standby' | 'Good' | 'Warning';
  rawCounts?: number;
  terminal: string;
  signal: string;
  forced: boolean;
  fault: boolean;
}

export const IOView: React.FC = () => {
  const { plcHealth, setMode, setProtocol, toggleReadOnly } = useRuntimeMode();
  const { telemetry } = usePlant();

  const [activeSection, setActiveSection] = useState<'all' | 'di' | 'ai' | 'outputs'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // S7 Real-time mapped I/O Table
  const [ioItems, setIoItems] = useState<IOChannelItem[]>([
    // Digital Inputs (DI)
    {
      tag: 'P101_RUN_FB',
      type: 'DI',
      address: '%I0.0',
      description: 'P-101 Raw Feed Pump Contactor Auxiliary Feedback',
      currentValue: telemetry.p101_running ? 'ON (1)' : 'OFF (0)',
      state: telemetry.p101_running ? 'Active' : 'Standby',
      terminal: 'X1:28-29',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'P101_TRIP',
      type: 'DI',
      address: '%I0.1',
      description: 'P-101 Motor Thermal Overload Relay Trip Contact',
      currentValue: 'OFF (0)',
      state: 'Normal',
      terminal: 'X1:30-31',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'P201_RUN_FB',
      type: 'DI',
      address: '%I0.2',
      description: 'P-201 Booster Pump Contactor Auxiliary Feedback',
      currentValue: telemetry.p201_running ? 'ON (1)' : 'OFF (0)',
      state: telemetry.p201_running ? 'Active' : 'Standby',
      terminal: 'X1:32-33',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'XV101_OPEN_FB',
      type: 'DI',
      address: '%I0.3',
      description: 'XV-101 Raw Intake Butterfly Valve Open Limit Switch',
      currentValue: telemetry.xv101_openingPercent > 10 ? 'ON (1)' : 'OFF (0)',
      state: telemetry.xv101_openingPercent > 10 ? 'Active' : 'Normal',
      terminal: 'X1:34-35',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'XV101_CLOSE_FB',
      type: 'DI',
      address: '%I0.4',
      description: 'XV-101 Butterfly Valve Full Closed Limit Switch',
      currentValue: telemetry.xv101_openingPercent <= 5 ? 'ON (1)' : 'OFF (0)',
      state: telemetry.xv101_openingPercent <= 5 ? 'Active' : 'Normal',
      terminal: 'X1:36-37',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'TK101_LSH',
      type: 'DI',
      address: '%I0.5',
      description: 'TK-101 Equalization Tank High-High Level Float Switch',
      currentValue: telemetry.tk101.currentLevelPercent >= 90 ? 'ON (1)' : 'OFF (0)',
      state: telemetry.tk101.currentLevelPercent >= 90 ? 'Tripped' : 'Normal',
      terminal: 'X1:38-39',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'TK101_LSL',
      type: 'DI',
      address: '%I0.6',
      description: 'TK-101 Low-Low Dry Run Protection Suction Switch',
      currentValue: telemetry.tk101.currentLevelPercent <= 15 ? 'ON (1)' : 'OFF (0)',
      state: telemetry.tk101.currentLevelPercent <= 15 ? 'Tripped' : 'Normal',
      terminal: 'X1:40-41',
      signal: '24V DC',
      forced: false,
      fault: false,
    },

    // Analog Inputs (AI)
    {
      tag: 'TK101_LEVEL',
      type: 'AI',
      address: '%IW64',
      description: 'TK-101 Equalization Tank Ultrasonic Level Transmitter',
      currentValue: `${telemetry.tk101.currentLevelPercent.toFixed(1)}% (${telemetry.tk101.currentLevelM3.toFixed(1)} m³)`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.tk101.currentLevelPercent / 100) * 22118),
      terminal: 'X1:14-15',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
    {
      tag: 'FLOW101',
      type: 'AI',
      address: '%IW66',
      description: 'P-101 Feed Pump Electromagnetic Flowmeter',
      currentValue: `${telemetry.p101_flowM3h.toFixed(1)} m³/h`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.p101_flowM3h / 25.0) * 22118),
      terminal: 'X1:16-17',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
    {
      tag: 'PRESS101',
      type: 'AI',
      address: '%IW68',
      description: 'P-101 Raw Feed Header Discharge Pressure',
      currentValue: `${telemetry.p101_pressureBar.toFixed(2)} bar`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.p101_pressureBar / 6.0) * 22118),
      terminal: 'X1:18-19',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
    {
      tag: 'RO_FEED_PRESS',
      type: 'AI',
      address: '%IW70',
      description: 'RO Membrane High-Pressure Suction Transmitter',
      currentValue: `${telemetry.ro_feedPressureBar.toFixed(1)} bar`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.ro_feedPressureBar / 25.0) * 22118),
      terminal: 'X1:20-21',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
    {
      tag: 'RO_PERM_FLOW',
      type: 'AI',
      address: '%IW72',
      description: 'Permeate Pure Water Header Flowmeter',
      currentValue: `${telemetry.ro_permeateFlowM3h.toFixed(1)} m³/h`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.ro_permeateFlowM3h / 20.0) * 22118),
      terminal: 'X1:22-23',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },

    // Outputs (DO & AO)
    {
      tag: 'P101_RUN_CMD',
      type: 'DO',
      address: '%Q0.0',
      description: 'P-101 Contactor Coil Run Output Interposing Relay',
      currentValue: telemetry.p101_running ? 'ON (1)' : 'OFF (0)',
      state: telemetry.p101_running ? 'Active' : 'Standby',
      terminal: 'X1:44-45',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'P201_RUN_CMD',
      type: 'DO',
      address: '%Q0.1',
      description: 'P-201 Booster Contactor Coil Run Command',
      currentValue: telemetry.p201_running ? 'ON (1)' : 'OFF (0)',
      state: telemetry.p201_running ? 'Active' : 'Standby',
      terminal: 'X1:46-47',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'XV101_CMD',
      type: 'DO',
      address: '%Q0.2',
      description: 'XV-101 Pneumatic Solenoid Valve Air Supply Demand',
      currentValue: telemetry.xv101_openingPercent > 0 ? 'ON (1)' : 'OFF (0)',
      state: telemetry.xv101_openingPercent > 0 ? 'Active' : 'Standby',
      terminal: 'X1:48-49',
      signal: '24V DC',
      forced: false,
      fault: false,
    },
    {
      tag: 'XV101_POS_AO',
      type: 'AO',
      address: '%QW64',
      description: 'XV-101 Electro-Pneumatic Modulating Positioner Setpoint',
      currentValue: `${telemetry.xv101_openingPercent.toFixed(1)}%`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.xv101_openingPercent / 100) * 22118),
      terminal: 'X1:52-53',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
    {
      tag: 'P202_VFD_AO',
      type: 'AO',
      address: '%QW66',
      description: 'P-202 High Pressure Pump Inovance/Siemens VFD Speed',
      currentValue: `${telemetry.p202_speedPercent.toFixed(1)}% (48.5 Hz)`,
      state: 'Good',
      rawCounts: Math.round(5530 + (telemetry.p202_speedPercent / 100) * 22118),
      terminal: 'X1:54-55',
      signal: '4-20 mA',
      forced: false,
      fault: false,
    },
  ]);

  const toggleFault = (tag: string) => {
    setIoItems((prev) =>
      prev.map((item) =>
        item.tag === tag ? { ...item, fault: !item.fault, state: !item.fault ? 'Warning' : 'Good' } : item
      )
    );
  };

  const toggleForce = (tag: string) => {
    setIoItems((prev) =>
      prev.map((item) =>
        item.tag === tag ? { ...item, forced: !item.forced } : item
      )
    );
  };

  const filteredItems = ioItems.filter((item) => {
    if (activeSection === 'di' && item.type !== 'DI') return false;
    if (activeSection === 'ai' && item.type !== 'AI') return false;
    if (activeSection === 'outputs' && item.type !== 'DO' && item.type !== 'AO') return false;
    if (
      searchFilter &&
      !item.tag.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !item.address.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <ModeBanner />

      {/* SECTION A: PLC Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Section A: PLC Controller Overview
                </h2>
                <SimulatedBadge verified={false} text="S7-1500 DRIVER" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Siemens SIMATIC S7-1515-2 PN · Firmware v2.9.2 · Rack 0 / Slot 2
              </p>
            </div>
          </div>

          {/* Mode Switcher (Virtual vs Real PLC) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono">
              <button
                onClick={() => setMode('VIRTUAL')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  plcHealth.mode === 'VIRTUAL'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Virtual PLC
              </button>
              <button
                onClick={() => setMode('REAL')}
                className={`px-3 py-1.5 rounded-md font-bold transition ${
                  plcHealth.mode === 'REAL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Real PLC
              </button>
            </div>

            <button
              onClick={toggleReadOnly}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
                plcHealth.readOnly
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
              }`}
            >
              {plcHealth.readOnly ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{plcHealth.readOnly ? 'Read-Only (Locked)' : 'Writes Enabled'}</span>
            </button>
          </div>
        </div>

        {/* PLC Diagnostics Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Connection</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{plcHealth.connectionState}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Protocol</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {plcHealth.protocol}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">IP Address</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">
              {plcHealth.ipAddress}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">CPU Status</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              RUN (Load: 12%)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Cycle Time</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {plcHealth.latencyMs} ms
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Last Comms</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
              {plcHealth.lastHeartbeat}
            </span>
          </div>
        </div>
      </div>

      {/* Sections B, C, D: Dedicated I/O Monitoring Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Table Filter Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 font-medium rounded-lg transition ${
                activeSection === 'all'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Channels ({ioItems.length})
            </button>
            <button
              onClick={() => setActiveSection('di')}
              className={`px-3 py-1.5 font-medium rounded-lg transition ${
                activeSection === 'di'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              B. Digital Inputs (DI)
            </button>
            <button
              onClick={() => setActiveSection('ai')}
              className={`px-3 py-1.5 font-medium rounded-lg transition ${
                activeSection === 'ai'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              C. Analog Inputs (AI)
            </button>
            <button
              onClick={() => setActiveSection('outputs')}
              className={`px-3 py-1.5 font-medium rounded-lg transition ${
                activeSection === 'outputs'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              D. Outputs (DO / AO)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search PLC tag or address..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs w-56"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">PLC Tag</th>
                <th className="py-3 px-3">Address</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-3">Terminal</th>
                <th className="py-3 px-3 text-right">Raw Counts (S7)</th>
                <th className="py-3 px-3 text-right">Current Value</th>
                <th className="py-3 px-3 text-center">State</th>
                <th className="py-3 px-3 text-center">Quality</th>
                <th className="py-3 px-4 text-center">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr
                  key={item.tag}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                    item.fault ? 'bg-rose-500/5' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {item.tag}
                  </td>
                  <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                    {item.address}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'AI'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : item.type === 'DI'
                          ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {item.description}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {item.terminal}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {item.rawCounts !== undefined ? `${item.rawCounts} / 27648` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {item.currentValue}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.state === 'Active' || item.state === 'Good'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : item.state === 'Tripped' || item.state === 'Warning'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {item.state}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <QualityIcon
                      quality={item.fault ? 'BAD' : 'GOOD'}
                      showText={true}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => toggleFault(item.tag)}
                        className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                          item.fault
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item.fault ? 'FAULT' : 'Sim Fault'}
                      </button>
                      <button
                        onClick={() => toggleForce(item.tag)}
                        className={`px-2 py-1 text-[10px] rounded font-semibold transition border ${
                          item.forced
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item.forced ? 'FORCED' : 'Force'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Standard IEC 61131-3 Addressing Model · Normalized 0-27648 Counts</span>
          <span>Virtual PLC Engine · Active Scanning</span>
        </div>
      </div>
    </div>
  );
};
