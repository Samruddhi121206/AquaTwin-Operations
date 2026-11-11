/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePlant } from '../../../context/PlantContext';
import { QualityIcon } from '../../shared/QualityIcon';
import { SimulatedBadge } from '../../shared/SimulatedBadge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Sliders,
  Layers,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  Send,
  Workflow,
  Zap,
} from 'lucide-react';

export const LiveBottomTabs: React.FC = () => {
  const {
    telemetry,
    equipmentList,
    alarms,
    acknowledgeAlarm,
    productionHistory,
    theme,
    setActiveModule,
  } = usePlant();

  const [activeTab, setActiveTab] = useState<
    'trends' | 'equipment' | 'sensors' | 'alarms' | 'commands'
  >('trends');

  const isDark = theme === 'dark';

  // Sensor diagnostic mock table derived from current telemetry
  const sensors = [
    {
      tag: 'LT-101',
      name: 'Raw Tank Ultrasonic Level',
      address: '%IW64',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.tk101.currentLevelPercent / 100) * 22118),
      currentMa: (4.0 + (telemetry.tk101.currentLevelPercent / 100) * 16.0).toFixed(2),
      engValue: `${telemetry.tk101.currentLevelM3.toFixed(1)} m³ (${telemetry.tk101.currentLevelPercent.toFixed(1)}%)`,
      range: '0 - 50.0 m³',
      quality: 'SIMULATED' as const,
      terminal: 'X1:14-15',
    },
    {
      tag: 'FIT-101',
      name: 'P-101 Discharge Electromagnetic Flow',
      address: '%IW66',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.p101_flowM3h / 25.0) * 22118),
      currentMa: (4.0 + (telemetry.p101_flowM3h / 25.0) * 16.0).toFixed(2),
      engValue: `${telemetry.p101_flowM3h.toFixed(1)} m³/h`,
      range: '0 - 25.0 m³/h',
      quality: 'SIMULATED' as const,
      terminal: 'X1:16-17',
    },
    {
      tag: 'PT-101',
      name: 'Raw Feed Header Pressure',
      address: '%IW68',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.p101_pressureBar / 6.0) * 22118),
      currentMa: (4.0 + (telemetry.p101_pressureBar / 6.0) * 16.0).toFixed(2),
      engValue: `${telemetry.p101_pressureBar.toFixed(2)} bar`,
      range: '0 - 6.0 bar',
      quality: 'SIMULATED' as const,
      terminal: 'X1:18-19',
    },
    {
      tag: 'PT-202',
      name: 'RO Membrane High-Pressure Feed',
      address: '%IW70',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.ro_feedPressureBar / 25.0) * 22118),
      currentMa: (4.0 + (telemetry.ro_feedPressureBar / 25.0) * 16.0).toFixed(2),
      engValue: `${telemetry.ro_feedPressureBar.toFixed(1)} bar`,
      range: '0 - 25.0 bar',
      quality: 'SIMULATED' as const,
      terminal: 'X1:20-21',
    },
    {
      tag: 'FIT-201',
      name: 'RO Pure Permeate Product Flow',
      address: '%IW72',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.ro_permeateFlowM3h / 20.0) * 22118),
      currentMa: (4.0 + (telemetry.ro_permeateFlowM3h / 20.0) * 16.0).toFixed(2),
      engValue: `${telemetry.ro_permeateFlowM3h.toFixed(1)} m³/h`,
      range: '0 - 20.0 m³/h',
      quality: 'SIMULATED' as const,
      terminal: 'X1:22-23',
    },
    {
      tag: 'LT-201',
      name: 'Permeate Buffer Storage Level',
      address: '%IW74',
      signal: '4-20mA',
      rawCounts: Math.round(5530 + (telemetry.tk201.currentLevelPercent / 100) * 22118),
      currentMa: (4.0 + (telemetry.tk201.currentLevelPercent / 100) * 16.0).toFixed(2),
      engValue: `${telemetry.tk201.currentLevelM3.toFixed(1)} m³ (${telemetry.tk201.currentLevelPercent.toFixed(1)}%)`,
      range: '0 - 35.0 m³',
      quality: 'SIMULATED' as const,
      terminal: 'X1:24-25',
    },
  ];

  // Sample Command Lifecycle Audit Entries (per Section 4.4 & 7)
  const sampleCommands = [
    {
      id: 'CMD-108',
      tagId: 'P101.RUN_CMD',
      action: 'START P-101 (Raw Feed Pump)',
      user: 'Operator (Shift B)',
      role: 'operator',
      state: 'FEEDBACK_CONFIRMED',
      lifecycle: [
        { state: 'REQUESTED', time: '10:14:02' },
        { state: 'VALIDATED', time: '10:14:02.100' },
        { state: 'SENT_TO_PLC', time: '10:14:02.120' },
        { state: 'PLC_ACCEPTED', time: '10:14:02.140' },
        { state: 'FEEDBACK_CONFIRMED', time: '10:14:03.200' },
      ],
      feedbackTag: 'P101.RUN_FB (%I0.0 = True)',
    },
    {
      id: 'CMD-107',
      tagId: 'XV101.DEMAND_PCT',
      action: 'SET XV-101 Stroke to 82.5%',
      user: 'PID Controller (Auto)',
      role: 'system',
      state: 'FEEDBACK_CONFIRMED',
      lifecycle: [
        { state: 'REQUESTED', time: '10:13:58' },
        { state: 'VALIDATED', time: '10:13:58.010' },
        { state: 'SENT_TO_PLC', time: '10:13:58.025' },
        { state: 'PLC_ACCEPTED', time: '10:13:58.035' },
        { state: 'FEEDBACK_CONFIRMED', time: '10:13:59.100' },
      ],
      feedbackTag: 'XV101.POS_FB (%IW64 = 82.5%)',
    },
    {
      id: 'CMD-106',
      tagId: 'P202.SPEED_PCT',
      action: 'RAMP P-202 HP Pump to 100%',
      user: 'Lead Engineer',
      role: 'engineer',
      state: 'FEEDBACK_CONFIRMED',
      lifecycle: [
        { state: 'REQUESTED', time: '10:10:15' },
        { state: 'VALIDATED', time: '10:10:15.050' },
        { state: 'SENT_TO_PLC', time: '10:10:15.080' },
        { state: 'PLC_ACCEPTED', time: '10:10:15.095' },
        { state: 'FEEDBACK_CONFIRMED', time: '10:10:17.500' },
      ],
      feedbackTag: 'VFD_P202.FREQ_FB (48.5 Hz)',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 pt-3 bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'trends'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Process Trends (Real-Time)</span>
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'equipment'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Equipment Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('sensors')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'sensors'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensor Diagnostics & 4-20mA</span>
          </button>

          <button
            onClick={() => setActiveTab('alarms')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'alarms'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Alarms ({alarms.filter((a) => !a.acknowledged).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'commands'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Command Lifecycle History</span>
          </button>
        </div>

        <SimulatedBadge verified={false} text="LIVE TELEMETRY STREAM" />
      </div>

      {/* Tab Panels */}
      <div className="p-4">
        {/* TAB 1: Trends */}
        {activeTab === 'trends' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono">
                Real-Time Telemetry Roll: TK-101 Level (%), Feed Pressure (bar), Permeate Flow (m³/h)
              </span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">
                Sampling Rate: 1.0s · Resolution: 60 data points
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionHistory.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="timestamp" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                  <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Line
                    type="monotone"
                    dataKey="permeateM3h"
                    name="Permeate Flow (m³/h)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="powerKw"
                    name="Plant Power (kW)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="recoveryPercent"
                    name="RO Recovery (%)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Equipment Telemetry */}
        {activeTab === 'equipment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentList.slice(0, 6).map((eq) => (
              <div
                key={eq.tag}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700/60">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{eq.tag}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        eq.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                    {eq.name}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {eq.manufacturer} · {eq.model}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono">
                  <span>Runtime: {eq.runtimeHours} hrs</span>
                  <button
                    onClick={() => setActiveModule('control_panel')}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
                  >
                    <Workflow className="w-3 h-3" />
                    <span>Trace Wiring</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Sensor Diagnostics */}
        {activeTab === 'sensors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-mono text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Instrument Tag</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Signal</th>
                  <th className="py-2.5 px-3">Terminal</th>
                  <th className="py-2.5 px-3 text-right">Raw Counts (Siemens)</th>
                  <th className="py-2.5 px-3 text-right">Loop Current</th>
                  <th className="py-2.5 px-3 text-right">Scaled Value</th>
                  <th className="py-2.5 px-3 text-center">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {sensors.map((s) => (
                  <tr key={s.tag} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                      <div>{s.tag}</div>
                      <div className="text-[9px] text-slate-400 font-sans">{s.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                      {s.address}
                    </td>
                    <td className="py-2.5 px-3">{s.signal}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">
                      {s.terminal}
                    </td>
                    <td className="py-2.5 px-3 text-right">{s.rawCounts} / 27648</td>
                    <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-semibold">
                      {s.currentMa} mA
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {s.engValue}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <QualityIcon quality={s.quality} showText={true} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Active Alarms */}
        {activeTab === 'alarms' && (
          <div className="space-y-2">
            {alarms.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.severity === 'critical'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{a.message}</span>
                      <span className="font-mono text-[10px] text-slate-500">[{a.tag}]</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Triggered: {a.timestamp} · Value: {a.value} (Trip Threshold: {a.threshold})
                    </div>
                  </div>
                </div>

                <div>
                  {a.acknowledged ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlarm(a.id)}
                      className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium text-[11px] hover:bg-rose-700 transition"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Safe Command Lifecycle History */}
        {activeTab === 'commands' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-mono">
              Industrial Command State Machine: REQUESTED → VALIDATED → SENT_TO_PLC → PLC_ACCEPTED → FEEDBACK_CONFIRMED
            </div>
            <div className="space-y-2">
              {sampleCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {cmd.action}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                        {cmd.tagId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      User: {cmd.user} ({cmd.role}) · Feedback Tag: {cmd.feedbackTag}
                    </div>
                  </div>

                  {/* Lifecycle Stages */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {cmd.lifecycle.map((step, idx) => (
                      <React.Fragment key={step.state}>
                        <div
                          className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center"
                          title={`${step.state} at ${step.time}`}
                        >
                          <div className="font-bold">{step.state}</div>
                          <div className="text-[8px] opacity-75">{step.time}</div>
                        </div>
                        {idx < cmd.lifecycle.length - 1 && (
                          <span className="text-slate-400">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

